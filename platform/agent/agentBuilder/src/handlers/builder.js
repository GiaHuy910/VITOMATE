const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    console.log("[runCommand] command:", command);
    console.log("[runCommand] cwd:", cwd);

    exec(
      command,
      {
        cwd,
        maxBuffer: 1024 * 1024 * 20,
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("[runCommand] Command failed!");
          console.error("[runCommand] error:", error.message);
          console.error("[runCommand] stderr:", stderr);
          console.error("[runCommand] stdout:", stdout);

          return reject(
            new Error(stderr?.trim() || error.message || "Command failed"),
          );
        }

        resolve({
          stdout,
          stderr,
        });
      },
    );
  });
}

// Build Docker Image và Push lên Registry

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

async function buildAndPushImage({ job_id, buildDir, image_tag }) {
  // 1. Tự động sinh Dockerfile nếu chưa có
  generateDefaultDockerfile(buildDir);

  let buildLogs = "";

  // 3. Tiến hành Docker Build
  console.log(`[Builder Handler] Bắt đầu build image: ${image_tag}...`);
  const buildCmd = `docker build -t ${image_tag} .`;
  const buildResult = await runCommand(buildCmd, buildDir);
  buildLogs += (buildResult.stdout || "") + "\n" + (buildResult.stderr || "");

  // 4. Push Image lên Registry
  console.log(
    `[Builder Handler] Đang push image lên Registry: ${image_tag}...`,
  );
  const pushCmd = `docker push ${image_tag}`;
  const pushResult = await runCommand(pushCmd, buildDir);
  buildLogs += (pushResult.stdout || "") + "\n" + (pushResult.stderr || "");

  // 5. Dọn dẹp Image cục bộ và Dangling layers để giải phóng dung lượng ổ cứng
  console.log(`[Builder Handler] Dọn dẹp local image: ${image_tag}...`);
  await runCommand(`docker rmi -f ${image_tag}`, buildDir).catch(() => {});
  await runCommand(`docker image prune -f`, buildDir).catch(() => {});

  return {
    success: true,
    job_id,
    image_tag,
    logs: buildLogs,
  };
}

module.exports = {
  buildAndPushImage,
};
