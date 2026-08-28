const path = require("path");
const fs = require("fs");
const gitHandler = require("../handlers/git");
const builderHandler = require("../handlers/builder");
const systemHandler = require("../handlers/system");

// Nguồn cấu hình (nên lấy từ process.env)
const REGISTRY_URL = process.env.REGISTRY_URL || "192.168.1.8:5000";
const APPS_DIR = process.env.APPS_DIR || "/opt/agent/apps";

// Logic cho job BUILD_AND_PACK
async function processBuildAndPack(job) {
  const {
    owner,
    name,
    branch = "main",
    imageTag: customTag,
    registryAuth,
  } = job.payload;

  const repoUrl =
    job.payload.repoUrl || `https://github.com/${owner}/${name}.git`;
  const imageTag = customTag || `${REGISTRY_URL}/${owner}/${name}:${branch}`;
  const buildDir = path.join(APPS_DIR, String(job.id));

  try {
    console.log(`[1/2] Đang tải source code từ ${repoUrl}...`);
    const gitResult = await gitHandler.cloneRepository({
      repoUrl,
      branch,
      buildDir,
    });

    console.log(`[2/2] Đang đóng gói Docker Image [${imageTag}]...`);
    const buildResult = await builderHandler.buildAndPushImage({
      buildDir,
      imageTag,
      registryAuth,
    });

    return {
      success: true,
      jobId: job.id,
      imageTag,
      logs: (gitResult?.logs || "") + "\n" + (buildResult?.logs || ""),
    };
  } finally {
    // Dọn dẹp thư mục tạm trong CẢ hai trường hợp: THÀNH CÔNG hoặc THẤT BẠI
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
    }
  }
}

async function processGetSystemStats(job) {
  const stats = await systemHandler.getSystemStats();
  return { success: true, jobId: job.id, stats };
}

// Map ánh xạ các loại Job
const JOB_HANDLERS = {
  BUILD_AND_PACK: processBuildAndPack,
  GET_SYSTEM_STATS: processGetSystemStats,
};

async function handleJob(job) {
  console.log(`[⚙️ EXECUTOR] Nhận Job [${job.id}] - Action: ${job.type}`);

  try {
    const handler = JOB_HANDLERS[job.type];
    if (!handler) {
      throw new Error(`Loại Job '${job.type}' không được hỗ trợ.`);
    }

    return await handler(job);
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
