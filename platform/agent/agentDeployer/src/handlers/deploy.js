const { exec } = require("child_process");
const net = require("net");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Hàm tìm một cổng trống ngẫu nhiên trên máy Worker
 */
async function getRandomFreePort(startPort = 30000, endPort = 39999) {
  return new Promise((resolve) => {
    const port =
      Math.floor(Math.random() * (endPort - startPort + 1)) + startPort;
    const server = net.createServer();

    server.listen(port, () => {
      server.once("close", () => resolve(port));
      server.close();
    });

    server.on("error", async () => {
      // Nếu cổng trùng hoặc đã bị chiếm, tự động tìm cổng khác
      resolve(await getRandomFreePort(startPort, endPort));
    });
  });
}

async function deployApp({
  imageTag,
  appPort,
  containerPort = 3000,
  containerName,
  envVars = {},
  memoryLimit = "512m", // 🟢 Giới hạn RAM tối đa cho App
  cpuLimit = "0.5", // 🟢 Giới hạn tối đa 50% CPU của 1 core
}) {
  // 🟢 Tự động cấp phát cổng ngẫu nhiên nếu Master không truyền appPort
  const finalAppPort = appPort || (await getRandomFreePort());

  console.log(`[🚀 DEPLOY] Step 1: Pulling image [${imageTag}]...`);
  await execPromise(`docker pull ${imageTag}`);

  console.log(
    `[🚀 DEPLOY] Step 2: Dừng & xóa container cũ [${containerName}]...`,
  );
  await execPromise(`docker rm -f ${containerName}`).catch(() => {});

  // Parse biến môi trường
  let envString = "";
  for (const [key, value] of Object.entries(envVars)) {
    envString += ` -e ${key}="${value}"`;
  }

  console.log(
    `[🚀 DEPLOY] Step 3: Khởi chạy Isolated Container [${containerName}] tại cổng [${finalAppPort}:${containerPort}]...`,
  );

  // 🟢 Bổ sung cờ chia ngăn tài nguyên (--memory, --cpus) & dùng finalAppPort
  const runCmd = `docker run -d \
    --name ${containerName} \
    --restart=always \
    --memory="${memoryLimit}" \
    --cpus="${cpuLimit}" \
    -p ${finalAppPort}:${containerPort} \
    ${envString} \
    ${imageTag}`;

  const { stdout } = await execPromise(runCmd);

  return {
    success: true,
    containerId: stdout.trim().substring(0, 12),
    port: finalAppPort,
    containerPort,
  };
}

module.exports = { deployApp };
