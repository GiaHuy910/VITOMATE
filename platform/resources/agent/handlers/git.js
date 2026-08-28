const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Thực thi lệnh Shell dưới dạng Promise
 */
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd, maxBuffer: 1024 * 1024 * 10 },
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
 * Clone repository từ GitHub dùng Access Token
 * @param {Object} params
 * @param {string} params.repoUrl - Ví dụ: "github.com/username/repository.git"
 * @param {string} params.accessToken - GitHub PAT
 * @param {string} params.branch - Branch cần build (default: "main")
 * @param {string} params.buildDir - Thư mục chứa code clone về
 */
async function cloneRepository({
  repoUrl,
  accessToken,
  branch = "main",
  buildDir,
}) {
  // 1. Chuẩn bị thư mục chứa code
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  // 2. Làm sạch URL repository (xóa https:// hoặc http:// nếu có)
  const cleanRepoUrl = repoUrl.replace(/^https?:\/\//, "");

  // 3. Tạo authenticated URL chứa Access Token
  // Format: https://<TOKEN>@github.com/user/repo.git
  const authenticatedUrl = `https://${accessToken}@${cleanRepoUrl}`;

  // 4. Thực thi lệnh git clone
  const cloneCmd = `git clone --depth 1 --single-branch --branch ${branch} ${authenticatedUrl} .`;

  console.log(`[Git Handler] Đang clone repo (Branch: ${branch})...`);
  const result = await runCommand(cloneCmd, buildDir);

  return {
    success: true,
    message: "Clone source code thành công",
    logs: result.stdout || result.stderr,
  };
}

module.exports = {
  cloneRepository,
};
