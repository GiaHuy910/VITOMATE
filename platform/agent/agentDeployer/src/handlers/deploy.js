const { exec } = require("child_process");
const net = require("net");
const util = require("util");

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
async function getContainerPort(containerName, containerPort) {
  try {
    const { stdout } = await execPromise(
      `docker port ${containerName} ${containerPort}`,
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
  imageTag,
  app_port,
  containerPort = 3000,
  containerName,
  envVars = {},
  memoryLimit = "512m",
  cpuLimit = "0.5",
}) {
  if (!imageTag) {
    throw new Error("imageTag là bắt buộc");
  }

  if (!containerName) {
    throw new Error("containerName là bắt buộc");
  }

  console.log(`[DEPLOY] Bắt đầu deploy ${containerName}`);
  console.log(`[DEPLOY] Image: ${imageTag}`);

  // =========================================================
  // STEP 1: Kiểm tra container cũ
  // =========================================================

  const hasOldContainer = await containerExists(containerName);

  let finalAppPort;

  if (hasOldContainer) {
    console.log(`[DEPLOY] Đã tìm thấy container cũ [${containerName}]`);

    /*
     * Nếu deploy lại:
     * cố gắng lấy port cũ để app không bị đổi địa chỉ.
     */
    finalAppPort =
      app_port || (await getContainerPort(containerName, containerPort));

    if (finalAppPort) {
      console.log(`[DEPLOY] Giữ lại port cũ: ${finalAppPort}`);
    }
  }

  // Nếu là deploy lần đầu hoặc không lấy được port cũ
  if (!finalAppPort) {
    finalAppPort = await getRandomFreePort();

    console.log(`[DEPLOY] Cấp port mới: ${finalAppPort}`);
  }

  // =========================================================
  // STEP 2: Pull image mới
  // =========================================================

  console.log(`[DEPLOY] Step 1: Pulling image [${imageTag}]...`);

  await execPromise(`docker pull ${imageTag}`);

  console.log(`[DEPLOY] Image [${imageTag}] đã được pull thành công.`);

  // =========================================================
  // STEP 3: Xóa container cũ
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
  // STEP 4: Tạo environment variables
  // =========================================================

  let envString = "";

  for (const [key, value] of Object.entries(envVars)) {
    envString += ` -e "${key}=${value}"`;
  }

  // =========================================================
  // STEP 5: Chạy container mới
  // =========================================================

  console.log(`[DEPLOY] Step 3: Khởi chạy container mới [${containerName}]`);

  console.log(`[DEPLOY] Port: ${finalAppPort}:${containerPort}`);

  const runCmd = `
    docker run -d \
    --name "${containerName}" \
    --restart=always \
    --memory="${memoryLimit}" \
    --cpus="${cpuLimit}" \
    -p ${finalAppPort}:${containerPort} \
    ${envString} \
    ${imageTag}
  `;

  let stdout;

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

  const containerId = stdout.trim().substring(0, 12);

  // =========================================================
  // STEP 6: Kiểm tra container
  // =========================================================

  try {
    const { stdout: status } = await execPromise(
      `docker inspect -f "{{.State.Running}}" ${containerName}`,
    );

    if (status.trim() !== "true") {
      throw new Error("Container được tạo nhưng không ở trạng thái running.");
    }
  } catch (error) {
    console.error(`[DEPLOY] Container mới không chạy thành công.`);

    throw error;
  }

  console.log(`[DEPLOY] Deploy thành công!`);

  console.log(`[DEPLOY] Container: ${containerName}`);

  console.log(`[DEPLOY] Container ID: ${containerId}`);

  console.log(`[DEPLOY] Port: ${finalAppPort}:${containerPort}`);

  console.log(`[DEPLOY] Image: ${imageTag}`);

  return {
    success: true,
    containerId,
    port: finalAppPort,
    containerPort,
    imageTag,
    containerName,
    replaced: hasOldContainer,
  };
}

module.exports = {
  deployApp,
};
