const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd, maxBuffer: 1024 * 1024 * 20 },
      (error, stdout, stderr) => {
        if (error) {
          return reject({ error: error.message, stderr, stdout });
        }
        resolve({ stdout, stderr });
      },
    );
  });
}

/**
 * Build Docker Image và Push lên Registry
 * @param {Object} params
 * @param {string} params.buildDir - Thư mục chứa source code (nơi có Dockerfile)
 * @param {string} params.imageTag - Tag cho Image (Ví dụ: "myregistry.com/apps/my-app:v1.0")
 * @param {Object} [params.registryAuth] - Cấu hình đăng nhập Registry (nếu là Private Registry)
 */
async function buildAndPushImage({ buildDir, imageTag, registryAuth }) {
  // 1. Kiểm tra sự tồn tại của Dockerfile
  const dockerfilePath = path.join(buildDir, "Dockerfile");
  if (!fs.existsSync(dockerfilePath)) {
    throw new Error("Không tìm thấy Dockerfile trong thư mục nguồn!");
  }

  let buildLogs = "";

  // 2. Đăng nhập Docker Registry nếu có thông tin Auth
  if (
    registryAuth &&
    registryAuth.server &&
    registryAuth.username &&
    registryAuth.password
  ) {
    console.log(
      `[Builder Handler] Đang đăng nhập Docker Registry: ${registryAuth.server}...`,
    );
    const loginCmd = `echo "${registryAuth.password}" | docker login ${registryAuth.server} -u "${registryAuth.username}" --password-stdin`;
    await runCommand(loginCmd, buildDir);
  }

  // 3. Tiến hành Docker Build
  console.log(`[Builder Handler] Bắt đầu build image: ${imageTag}...`);
  const buildCmd = `docker build -t ${imageTag} .`;
  const buildResult = await runCommand(buildCmd, buildDir);
  buildLogs += buildResult.stdout + "\n" + buildResult.stderr;

  // 4. Push Image lên Registry
  console.log(`[Builder Handler] Đang push image lên Registry: ${imageTag}...`);
  const pushCmd = `docker push ${imageTag}`;
  const pushResult = await runCommand(pushCmd, buildDir);
  buildLogs += pushResult.stdout + "\n" + pushResult.stderr;

  // 5. Dọn dẹp Image cục bộ trên máy Builder để giải phóng bộ nhớ
  console.log(`[Builder Handler] Dọn dẹp local image: ${imageTag}...`);
  await runCommand(`docker rmi ${imageTag}`, buildDir).catch(() => {});

  return {
    success: true,
    imageTag,
    logs: buildLogs,
  };
}

module.exports = {
  buildAndPushImage,
};
