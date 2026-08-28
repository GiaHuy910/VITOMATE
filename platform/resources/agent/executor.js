const path = require("path");
const fs = require("fs");
const gitHandler = require("./handlers/git");
const builderHandler = require("./handlers/builder");
const systemHandler = require("./handlers/system");

async function handleJob(job) {
  console.log(`[⚙️ EXECUTOR] Nhận Job [${job.id}] - Action: ${job.type}`);

  try {
    switch (job.type) {
      case "BUILD_AND_PACK": {
        // Tạo thư mục build tạm dựa trên Job ID
        const buildDir = path.join("/opt/agent/apps", job.id);

        // Bước 1: Clone Code từ GitHub
        console.log(`[1/2] Đang tải source code...`);
        const gitResult = await gitHandler.cloneRepository({
          repoUrl: job.payload.repoUrl,
          accessToken: job.payload.accessToken,
          branch: job.payload.branch || "main",
          buildDir,
        });

        // Bước 2: Build & Push Docker Image
        console.log(`[2/2] Đang đóng gói Docker Image...`);
        const buildResult = await builderHandler.buildAndPushImage({
          buildDir,
          imageTag: job.payload.imageTag,
          registryAuth: job.payload.registryAuth,
        });

        // Dọn dẹp thư mục code tạm sau khi build xong
        fs.rmSync(buildDir, { recursive: true, force: true });

        return {
          success: true,
          jobId: job.id,
          imageTag: buildResult.imageTag,
          logs: gitResult.logs + "\n" + buildResult.logs,
        };
      }

      case "GET_SYSTEM_STATS": {
        const stats = await systemHandler.getSystemStats();
        return { success: true, jobId: job.id, stats };
      }

      default:
        throw new Error(`Loại Job '${job.type}' không được hỗ trợ.`);
    }
  } catch (err) {
    console.error(`[❌ JOB FAILED] [${job.id}]:`, err.message || err);
    return {
      success: false,
      jobId: job.id,
      error: err.message || err.error || "Thực thi thất bại",
      logs: err.stderr || "",
    };
  }
}

module.exports = { handleJob };
