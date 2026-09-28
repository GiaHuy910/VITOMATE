const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");

class SSHService {
  async uploadDir(sftp, localDir, remoteDir) {
    await new Promise((resolve, reject) => {
      sftp.mkdir(remoteDir, (err) => {
        if (err && err.code !== 4) return reject(err);
        resolve();
      });
    });

    const files = fs.readdirSync(localDir);
    for (const file of files) {
      const localPath = path.join(localDir, file);
      const remotePath = path.posix.join(remoteDir, file);
      const stat = fs.statSync(localPath);

      if (stat.isDirectory()) {
        await this.uploadDir(sftp, localPath, remotePath);
      } else {
        await new Promise((resolve, reject) => {
          sftp.fastPut(localPath, remotePath, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
    }
  }

  async installPublicKey(conn) {
    const configuredKeyPath = config.worker.primaryKeyPath;

    if (!configuredKeyPath) {
      throw new Error("primaryKeyPath chưa được cấu hình");
    }

    const privateKeyPath = path.resolve(process.cwd(), configuredKeyPath);

    const publicKeyPath = `${privateKeyPath}.pub`;

    console.log(`[SSH] Private Key: ${privateKeyPath}`);
    console.log(`[SSH] Public Key: ${publicKeyPath}`);

    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`Không tìm thấy SSH private key: ${privateKeyPath}`);
    }

    if (!fs.existsSync(publicKeyPath)) {
      throw new Error(`Không tìm thấy SSH public key: ${publicKeyPath}`);
    }

    const publicKey = fs.readFileSync(publicKeyPath, "utf8").trim();

    if (!publicKey) {
      throw new Error("SSH public key đang rỗng");
    }

    console.log("[SSH] Đã đọc SSH Public Key thành công");

    console.log(`[SSH] Public Key: ${publicKey.substring(0, 30)}...`);

    /*
     * Escape dấu ' để tránh làm hỏng câu lệnh shell
     */
    const escapedPublicKey = publicKey.replace(/'/g, "'\\''");

    const addKeyCommand = `
mkdir -p ~/.ssh &&
chmod 700 ~/.ssh &&
touch ~/.ssh/authorized_keys &&
chmod 600 ~/.ssh/authorized_keys &&
grep -qxF '${escapedPublicKey}' ~/.ssh/authorized_keys ||
echo '${escapedPublicKey}' >> ~/.ssh/authorized_keys
`;

    console.log("[SSH] Đang ghi Public Key vào ~/.ssh/authorized_keys...");

    return new Promise((resolve, reject) => {
      conn.exec(addKeyCommand, (err, stream) => {
        if (err) {
          console.error("[SSH] Lỗi conn.exec() khi cài Public Key:", err);

          return reject(err);
        }

        let stdout = "";
        let stderr = "";

        stream.on("data", (data) => {
          const message = data.toString();

          stdout += message;

          console.log(`[SSH PUBLIC KEY STDOUT]: ${message}`);
        });

        stream.stderr.on("data", (data) => {
          const message = data.toString();

          stderr += message;

          console.error(`[SSH PUBLIC KEY STDERR]: ${message}`);
        });

        stream.on("error", (err) => {
          console.error("[SSH] Stream error khi cài Public Key:", err);

          reject(err);
        });

        stream.on("close", (code) => {
          console.log(`[SSH] installPublicKey kết thúc với exit code: ${code}`);

          if (code === 0) {
            console.log("[SSH] Đã cài SSH public key vào Worker thành công");

            resolve();
          } else {
            reject(
              new Error(
                `Lỗi khi ghi authorized_keys. Exit code: ${code}\n${stderr}`,
              ),
            );
          }
        });
      });
    });
  }

  /**
   * Helper: Tự động phân luồng kết nối (Key -> Password Fallback)
   */
  async getSSHClient(vmConfig) {
    const privateKeyPath = path.resolve(
      process.cwd(),
      config.worker.primaryKeyPath,
    );

    // 1. Thử kết nối bằng Private Key (Truy cập dạng Update)
    if (fs.existsSync(privateKeyPath)) {
      try {
        const privateKey = fs.readFileSync(privateKeyPath, "utf8");
        const conn = await new Promise((resolve, reject) => {
          const client = new Client();
          client.on("ready", () => resolve(client));
          client.on("error", reject);
          client.connect({
            host: vmConfig.host,
            port: vmConfig.port || 22,
            username: vmConfig.username,
            privateKey,
            readyTimeout: 5000,
          });
        });

        console.log(
          "[SSH] Kết nối thành công bằng Private Key (Chế độ: UPDATE)",
        );
        return { conn, isFirstTime: false };
      } catch (err) {
        console.log(
          "[SSH] Không thể dùng Key, chuyển sang Password (Chế độ: FIRST BOOTSTRAP)",
        );
      }
    }

    // 2. Nếu không có Key hoặc Key lỗi -> Kết nối bằng Password (Bootstrap lần đầu)
    const conn = await new Promise((resolve, reject) => {
      const client = new Client();
      client.on("ready", () => resolve(client));
      client.on("error", reject);
      client.connect({
        host: vmConfig.host,
        port: vmConfig.port || 22,
        username: vmConfig.username,
        password: vmConfig.password,
        readyTimeout: 10000,
      });
    });

    console.log(
      "[SSH] Kết nối thành công bằng Password (Chế độ: FIRST BOOTSTRAP)",
    );
    return { conn, isFirstTime: true };
  }

  async bootstrapWorker(vmConfig) {
    const {
      masterUrl,
      registryUrl,
      worker_id,
      agentToken,
      host,
      username,
      password,
    } = vmConfig;

    if (
      !masterUrl ||
      !registryUrl ||
      !worker_id ||
      !host ||
      !username ||
      !agentToken
    ) {
      throw new Error("Thiếu cấu hình tham số bắt buộc để Bootstrap");
    }

    const role = vmConfig.role.toUpperCase();
    const agentFolderNameMap = {
      BUILDER: "agentBuilder",
      DEPLOYER: "agentDeployer",
    };
    const agentFolderName = agentFolderNameMap[role];

    const sourceAgentDir = path.join(
      __dirname,
      `../../agent/${agentFolderName}`,
    );
    if (!fs.existsSync(sourceAgentDir)) {
      throw new Error(`Thư mục nguồn Agent không tồn tại: ${sourceAgentDir}`);
    }

    // Tự nhận diện lần đầu hay lần sau
    const { conn, isFirstTime } = await this.getSSHClient(vmConfig);

    try {
      // Nếu là lần đầu -> Cài Public Key để phục vụ các lần sau
      if (isFirstTime) {
        console.log(
          "[SSH] Lần đầu Bootstrap: Đang tiến hành cài SSH Public Key...",
        );
        await this.installPublicKey(conn);
      }

      // Xóa agent tạm cũ
      await new Promise((resolve) => {
        conn.exec("rm -rf /tmp/agent", () => resolve());
      });

      // Mở SFTP để upload source Agent
      const sftp = await new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp)));
      });

      console.log(
        `[SFTP] Đang Sync source code [${agentFolderName}] sang Worker...`,
      );
      await this.uploadDir(sftp, sourceAgentDir, "/tmp/agent");

      const command = `
        sudo -S -p "" env \
        MASTER_URL="${masterUrl}" \
        REGISTRY_URL="${registryUrl}" \
        WORKER_ID="${worker_id}" \
        WORKER_HOST="${host}" \
        AGENT_ROLE="${role}" \
        AGENT_TOKEN="${agentToken}" \
        IS_UPDATE="${!isFirstTime}" \
        bash -c '
          chmod +x /tmp/agent/scripts/bootstrap.sh &&
          /tmp/agent/scripts/bootstrap.sh
        '
      `;

      await new Promise((resolve, reject) => {
        conn.exec(command, (err, stream) => {
          if (err) return reject(err);

          // Nhập password cho sudo nếu chạy lần đầu bằng password
          if (password) {
            stream.write(`${password}\n`);
          }

          stream.stderr.on("data", (data) =>
            console.error(`[STDERR]: ${data}`),
          );
          stream.on("data", (data) => console.log(`[STDOUT]: ${data}`));
          stream.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Bootstrap thất bại với exit code: ${code}`));
          });
        });
      });

      console.log(
        `[SSH] Worker [${worker_id}] ${isFirstTime ? "Bootstrap" : "Update"} thành công!`,
      );
      conn.end();
      return true;
    } catch (error) {
      conn.end();
      throw error;
    }
  }
}

module.exports = new SSHService();
