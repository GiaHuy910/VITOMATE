const { exec } = require("child_process");
const fs = require("fs");

function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd, maxBuffer: 1024 * 1024 * 10 },
      (error, stdout, stderr) => {
        if (error) return reject({ error: error.message, stderr, stdout });
        resolve({ stdout, stderr });
      },
    );
  });
}

async function cloneRepository({ repoUrl, branch = "main", buildDir }) {
  // Dọn dẹp và tạo mới thư mục chứa source code
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  // Đảm bảo URL có dạng HTTPS hợp lệ
  let formattedUrl = repoUrl;
  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://")
  ) {
    formattedUrl = `https://${formattedUrl}`;
  }

  // Câu lệnh clone trực tiếp không dùng Token
  const cloneCmd = `git clone --depth 1 --single-branch --branch ${branch} ${formattedUrl} .`;

  console.log(
    `[Git Handler] Đang clone repo (${branch}) từ ${formattedUrl}...`,
  );
  const result = await runCommand(cloneCmd, buildDir);

  return {
    success: true,
    logs: result.stdout || result.stderr,
  };
}

module.exports = { cloneRepository };
