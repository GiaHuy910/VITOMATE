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
 * @param {string} params.imageTag - Tag cho Image (Ví dụ: "192.168.1.18:5000/apps/my-app:main")
 * @param {Object} [params.registryAuth] - Cấu hình đăng nhập Registry (nếu là Private Registry)
 */

// Hàm phụ trợ tự động sinh Dockerfile mặc định nếu repo người dùng chưa có
function generateDefaultDockerfile(buildDir) {
  const dockerfilePath = path.join(buildDir, "Dockerfile");

  // Kiểm tra nếu đã có Dockerfile thì không làm gì cả
  if (fs.existsSync(dockerfilePath)) return;

  console.log(
    "[Builder Handler] Không thấy Dockerfile, đang tự động phát hiện loại dự án...",
  );

  // Dự án Node.js (có file package.json)
  if (fs.existsSync(path.join(buildDir, "package.json"))) {
    const defaultNodeDockerfile = `
      FROM node:18-alpine
      WORKDIR /app
      COPY package*.json ./
      RUN npm install --production
      COPY . .
      EXPOSE 3000
      CMD ["npm", "start"]
      `;
    fs.writeFileSync(dockerfilePath, defaultNodeDockerfile.trim());
    console.log("[Builder Handler] Đã tạo Dockerfile mặc định cho Node.js!");
    return;
  }

  // Dự án Python (có file requirements.txt)
  if (fs.existsSync(path.join(buildDir, "requirements.txt"))) {
    const defaultPythonDockerfile = `
      FROM python:3.10-slim
      WORKDIR /app
      COPY requirements.txt .
      RUN pip install --no-cache-dir -r requirements.txt
      COPY . .
      EXPOSE 5000
      CMD ["python", "main.py"]
      `;
    fs.writeFileSync(dockerfilePath, defaultPythonDockerfile.trim());
    console.log("[Builder Handler] Đã tạo Dockerfile mặc định cho Python!");
    return;
  }

  // Nếu không nhận diện được dự án
  throw new Error(
    "Không tìm thấy Dockerfile và không thể tự động nhận diện ngôn ngữ nguồn!",
  );
}

async function buildAndPushImage({ buildDir, imageTag, registryAuth }) {
  // 1. Tự động sinh Dockerfile nếu chưa có
  generateDefaultDockerfile(buildDir);

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
  buildLogs += (buildResult.stdout || "") + "\n" + (buildResult.stderr || "");

  // 4. Push Image lên Registry
  console.log(`[Builder Handler] Đang push image lên Registry: ${imageTag}...`);
  const pushCmd = `docker push ${imageTag}`;
  const pushResult = await runCommand(pushCmd, buildDir);
  buildLogs += (pushResult.stdout || "") + "\n" + (pushResult.stderr || "");

  // 5. Dọn dẹp Image cục bộ và Dangling layers để giải phóng dung lượng ổ cứng
  console.log(`[Builder Handler] Dọn dẹp local image: ${imageTag}...`);
  await runCommand(`docker rmi -f ${imageTag}`, buildDir).catch(() => {});
  await runCommand(`docker image prune -f`, buildDir).catch(() => {});

  return {
    success: true,
    imageTag,
    logs: buildLogs,
  };
}

module.exports = {
  buildAndPushImage,
};
