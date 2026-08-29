const deployHandler = require("../handlers/deploy");
const systemHandler = require("../handlers/system");
const os = require("os");

/**
 * Lấy IP v4 Local/Public của máy Deploy Worker
 */
function getWorkerIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

async function processDeployApp(job) {
  const jobId = job.jobId || job.id;
  const payload = job.payload || job || {}; // 🟢 Tránh lỗi payload null

  const {
    imageTag,
    appPort,
    containerPort = 3000,
    envVars = {},
    memoryLimit,
    cpuLimit,
    appId,
    appName,
  } = payload;

  const identifier = appId || appName || jobId;
  const containerName = `app-${identifier}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const deployResult = await deployHandler.deployApp({
    imageTag,
    appPort,
    containerPort,
    containerName,
    envVars,
    memoryLimit,
    cpuLimit,
  });

  const workerIp = getWorkerIp();
  const publicUrl = `http://${workerIp}:${deployResult.port}`;

  console.log(`[🚀 DEPLOY SUCCESS] App live at: ${publicUrl}`);

  return {
    success: true,
    jobId,
    containerId: deployResult.containerId,
    port: deployResult.port,
    publicUrl: publicUrl,
    logs: `Đã khởi chạy container ${containerName} tại địa chỉ ${publicUrl}`,
  };
}

// Bảng ánh xạ Job Handlers
const JOB_HANDLERS = {
  DEPLOY_APP: processDeployApp,
  GET_SYSTEM_STATS: async (job) => ({
    success: true,
    jobId: job.jobId || job.id,
    stats: await systemHandler.getSystemStats(),
  }),
};

async function handleJob(job) {
  const jobId = job.jobId || job.id;

  // 🟢 LUÔN ĐẢM BẢO CÓ ACTION TYPE
  const actionType = job.type || "DEPLOY_APP";

  console.log(
    `[⚙️ DEPLOY EXECUTOR] Nhận Job [${jobId}] - Action: ${actionType}`,
  );

  try {
    const handler = JOB_HANDLERS[actionType];
    if (!handler) {
      throw new Error(
        `Loại Job '${actionType}' không được hỗ trợ bởi Deploy Agent.`,
      );
    }

    // Gắn type vào job object phòng trường hợp hàm xử lý bên dưới cần dùng
    const normalizedJob = { ...job, type: actionType };
    return await handler(normalizedJob);
  } catch (err) {
    console.error(`[❌ DEPLOY FAILED] [${jobId}]:`, err.message || err);
    return {
      success: false,
      jobId, // 🟢 Đảm bảo luôn trả jobId về để API report không bị rỗng
      error: err.message || err,
      logs: err.stderr || err.stack || "",
    };
  }
}

module.exports = { handleJob };
