const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function deployApp({
  imageTag,
  appPort,
  containerPort = 3000,
  containerName,
  envVars = {},
  memoryLimit = "512m", // 🟢 Giới hạn RAM tối đa cho App
  cpuLimit = "0.5", // 🟢 Giới hạn tối đa 50% CPU của 1 core
}) {
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
    `[🚀 DEPLOY] Step 3: Khởi chạy Isolated Container [${containerName}]...`,
  );

  // 🟢 Bổ sung cờ chia ngăn tài nguyên (--memory, --cpus)
  const runCmd = `docker run -d \
    --name ${containerName} \
    --restart=always \
    --memory="${memoryLimit}" \
    --cpus="${cpuLimit}" \
    -p ${appPort}:${containerPort} \
    ${envString} \
    ${imageTag}`;

  const { stdout } = await execPromise(runCmd);

  return {
    success: true,
    containerId: stdout.trim().substring(0, 12),
    port: appPort,
  };
}

module.exports = { deployApp };
