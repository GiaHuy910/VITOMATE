const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const os = require("os");

class SSHService {
  /**
   * Lấy IP LAN thực tế của máy Master (ví dụ: 192.168.1.8)
   */
  getPrimaryMasterIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      if (
        name.includes("VirtualBox") ||
        name.includes("vEthernet") ||
        name.includes("VMware")
      )
        continue;

      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          if (iface.address.startsWith("192.168.1.")) {
            return iface.address;
          }
        }
      }
    }
    return "192.168.1.8";
  }

  /**
   * Tải đệ quy toàn bộ thư mục sang Remote máy ảo
   */
  async uploadDir(sftp, localDir, remoteDir) {
    await new Promise((resolve) => sftp.mkdir(remoteDir, () => resolve()));

    const files = fs.readdirSync(localDir);

    for (const file of files) {
      const localPath = path.join(localDir, file);
      const remotePath = path.posix.join(remoteDir, file);

      if (fs.statSync(localPath).isDirectory()) {
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

  /**
   * Kết nối SSH tới Worker VM và thực hiện đẩy file/chạy script Bootstrap
   */
  async bootstrapWorker(vmConfig) {
    return new Promise((resolve, reject) => {
      // 1. Xử lý IP Master URL
      let rawMasterUrl = vmConfig.masterUrl || "http://localhost:4000";
      if (
        rawMasterUrl.includes("localhost") ||
        rawMasterUrl.includes("127.0.0.1")
      ) {
        const masterIp = this.getPrimaryMasterIp();
        const port = rawMasterUrl.split(":")[2] || "4000";
        rawMasterUrl = `http://${masterIp}:${port}`;
      }

      // 2. Xác định thư mục Nguồn dựa trên Role (Default: BUILDER)
      const role = (vmConfig.role || vmConfig.type || "BUILDER").toUpperCase();
      const agentFolderName =
        role === "DEPLOYER" ? "agentDeployer" : "agentBuilder";

      // Trỏ thẳng tới agentBuilder hoặc agentDeployer (Cấu trúc thư mục phẳng mới)
      const sourceAgentDir = path.join(
        __dirname,
        `../../agent/${agentFolderName}`,
      );

      console.log(
        `[SSH] Chuẩn bị Setup cho Role: ${role} | Nguồn: ${sourceAgentDir}`,
      );

      if (!fs.existsSync(sourceAgentDir)) {
        return reject(
          new Error(`Thư mục nguồn không tồn tại: ${sourceAgentDir}`),
        );
      }

      const conn = new Client();

      conn.on("ready", () => {
        console.log(`[SSH] Kết nối thành công tới VM: ${vmConfig.host}`);

        // 3. Dọn dẹp /tmp/agent cũ trên máy ảo trước khi mở SFTP upload
        conn.exec("rm -rf /tmp/agent", (cleanErr) => {
          if (cleanErr) {
            console.warn("[SSH] Không thể xóa /tmp/agent cũ, bỏ qua...");
          }

          conn.sftp(async (err, sftp) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            try {
              console.log(
                `[SFTP] Đang tải toàn bộ thư mục [${agentFolderName}] sang /tmp/agent...`,
              );

              // Upload toàn bộ mã nguồn vào thẳng /tmp/agent
              await this.uploadDir(sftp, sourceAgentDir, "/tmp/agent");

              console.log(
                "[SFTP] Upload thành công! Bắt đầu chạy Script Bootstrap...",
              );

              // Exec cấp quyền và chạy trực tiếp /tmp/agent/scripts/bootstrap.sh
              const command = `echo '${vmConfig.password}' | sudo -S env MASTER_URL="${rawMasterUrl}" WORKER_ID="${vmConfig.id || "worker-01"}" AGENT_ROLE="${role}" bash -c "chmod +x /tmp/agent/scripts/bootstrap.sh && /tmp/agent/scripts/bootstrap.sh"`;

              conn.exec(command, (execErr, stream) => {
                if (execErr) {
                  conn.end();
                  return reject(execErr);
                }

                stream
                  .on("close", (code) => {
                    console.log(
                      `[SSH] Bootstrap hoàn tất với mã thoát: ${code}`,
                    );
                    conn.end();
                    if (code === 0) resolve(true);
                    else
                      reject(
                        new Error(`Bootstrap thất bại với exit code ${code}`),
                      );
                  })
                  .on("data", (data) => console.log(`[Worker STDOUT]: ${data}`))
                  .stderr.on("data", (data) =>
                    console.error(`[Worker STDERR]: ${data}`),
                  );
              });
            } catch (uploadErr) {
              conn.end();
              reject(new Error(`[SFTP Error]: ${uploadErr.message}`));
            }
          });
        });
      });

      conn.on("error", (err) => {
        conn.end();
        reject(err);
      });

      conn.connect({
        host: vmConfig.host,
        port: vmConfig.port || 22,
        username: vmConfig.username,
        password: vmConfig.password,
        readyTimeout: 20000,
      });
    });
  }
}

module.exports = new SSHService();
