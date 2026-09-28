const { exec } = require("child_process");
const net = require("net");
const util = require("util");

const config = require("../config/config");

const execPromise = util.promisify(exec);

/**
 * Tìm một port trống trên Worker
 */
async function getRandomFreePort(startPort = 30000, endPort = 39999) {
  return new Promise((resolve, reject) => {
    const port =
      Math.floor(Math.random() * (endPort - startPort + 1)) + startPort;

    const server = net.createServer();

    server.once("error", async () => {
      try {
        resolve(await getRandomFreePort(startPort, endPort));
      } catch (error) {
        reject(error);
      }
    });

    server.listen(port, () => {
      server.close(() => {
        resolve(port);
      });
    });
  });
}

/**
 * Kiểm tra container có tồn tại hay không
 */
async function containerExists(containerName) {
  try {
    await execPromise(`docker inspect ${containerName}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy port host đang được container sử dụng
 */
async function getContainerPort(containerName, container_port) {
  try {
    const { stdout } = await execPromise(
      `docker port ${containerName} ${container_port}`,
    );

    const match = stdout.match(/:(\d+)/);

    if (!match) {
      return null;
    }

    return Number(match[1]);
  } catch {
    return null;
  }
}

/**
 * Deploy ứng dụng
 */
async function deployApp({
  job_id,
  app_id,
  image_tag,
  container_port,
  deployment_order,
  env_vars = {},
  memoryLimit = "512m",
  cpuLimit = "0.5",
}) {
  worker_id = config.WORKER_ID;
  const containerName = `app-${String(app_id)}`;

  console.log(`[DEPLOY] Bắt đầu deploy ${containerName}`);

  // =========================================================
  // STEP 1: Kiểm tra container cũ
  // =========================================================

  const hasOldContainer = await containerExists(containerName);

  let final_app_port;

  if (hasOldContainer) {
    console.log(`[DEPLOY] Đã tìm thấy container cũ [${containerName}]`);

    /*
     * Nếu deploy lại:
     * cố gắng lấy port cũ để app không bị đổi địa chỉ.
     */
    final_app_port = await getContainerPort(containerName, container_port);

    if (final_app_port) {
      console.log(`[DEPLOY] Giữ lại port cũ: ${final_app_port}`);
    }
  }

  // Nếu là deploy lần đầu hoặc không lấy được port cũ
  if (!final_app_port) {
    final_app_port = await getRandomFreePort();

    console.log(`[DEPLOY] Cấp port mới: ${final_app_port}`);
  }

  // =========================================================
  // STEP 2: Xóa container cũ
  // =========================================================

  if (hasOldContainer) {
    console.log(`[DEPLOY] Step 2: Dừng container cũ [${containerName}]...`);

    await execPromise(`docker rm -f ${containerName}`);

    console.log(`[DEPLOY] Container cũ đã được xóa.`);
  } else {
    console.log(
      `[DEPLOY] Step 2: Không có container cũ. Đây là deploy lần đầu.`,
    );
  }

  // =========================================================
  // STEP 3: Tạo environment variables
  // =========================================================

  console.log(`[DEPLOY] Step 3: Tạo environment variables...`);

  let env_string = "";

  for (const [key, value] of Object.entries(env_vars)) {
    env_string += ` -e "${key}=${value}"`;
  }

  // =========================================================
  // STEP 4: Chạy container mới
  // =========================================================

  console.log(`[DEPLOY] Step 4: Khởi chạy container mới [${containerName}]`);

  console.log(`[DEPLOY] Port: ${final_app_port}:${container_port}`);

  const runCmd = `
    docker run -d \
    --name "${containerName}" \
    --restart=always \
    --memory="${memoryLimit}" \
    --cpus="${cpuLimit}" \
    -p ${final_app_port}:${container_port} \
    ${env_string} \
    ${image_tag}
  `;

  let stdout;
  const public_url = `http://${config.WORKER_HOST}:${final_app_port}`;

  try {
    const result = await execPromise(runCmd);
    stdout = result.stdout;
  } catch (error) {
    console.error(`[DEPLOY] Không thể khởi chạy container mới.`);

    /*
     * Nếu container cũ đã bị xóa và container mới
     * không chạy được thì deploy thất bại.
     */
    throw new Error(`Docker run failed: ${error.stderr || error.message}`);
  }

  const container_id = stdout.trim().substring(0, 12);

  // =========================================================
  // STEP 6: Kiểm tra container
  // =========================================================

  try {
    const { stdout: status } = await execPromise(
      `docker inspect -f "{{.State.Running}}" ${containerName}`,
    );

    if (status.trim() !== "true") {
      throw new Error(
        "[DEPLOY] step 6: Container được tạo nhưng không ở trạng thái running.",
      );
    }
  } catch (error) {
    console.error(`[DEPLOY] Container mới không chạy thành công.`);

    throw error;
  }

  console.log(`[DEPLOY] Deploy thành công!`);

  console.log(`[DEPLOY] Container: ${containerName}`);

  console.log(`[DEPLOY] Container ID: ${container_id}`);

  console.log(`[DEPLOY] Port: ${final_app_port}:${container_port}`);

  console.log(`[DEPLOY] Image: ${image_tag}`);

  return {
    success: true,
    job_id,
    app_id,
    worker_id,
    container_port,
    public_url,
    image_tag,
    deployment_order,
  };
}

module.exports = {
  deployApp,
};
