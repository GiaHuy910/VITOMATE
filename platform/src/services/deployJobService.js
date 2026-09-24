const Job = require("../models/job");
const Workers = require("../models/workers");
const App = require("../models/app");

/**
 * Tạo Build Job mới và lưu vào MongoDB
 */
async function createBuildJob({ repo_id, owner, name, branch }) {
  const jobId = `job-build-${Date.now()}`;
  const imageTag = `192.168.1.8:5001/apps/${repo_id}:${branch || "latest"}`;

  const newJob = await Job.create({
    jobId,
    repo_id,
    owner,
    appName: name || repo_id,
    branch: branch || "main",
    imageTag,
    status: "PENDING",
  });

  console.log(`[Platform Queue] Đã thêm Job mới vào DB: ${newJob.jobId}`);

  return {
    id: newJob.jobId,
    type: "BUILD_AND_PACK",
    payload: {
      repo_id: newJob.repo_id,
      owner: newJob.owner,
      name: newJob.appName,
      branch: newJob.branch,
      imageTag: newJob.imageTag,
    },
  };
}

/**
 * Lấy một Job PENDING ra khỏi DB cho Builder Worker Polling
 */
async function getNextJob() {
  const job = await Job.findOneAndUpdate(
    { status: "PENDING" },
    { $set: { status: "BUILDING" } },
    {
      sort: { createdAt: 1 },
      returnDocument: "after",
    },
  );

  if (!job) return null;

  return {
    id: job.jobId,
    type: "BUILD_AND_PACK",
    payload: {
      repo_id: job.repo_id,
      owner: job.owner,
      name: job.appName,
      branch: job.branch,
      imageTag: job.imageTag,
    },
  };
}

/**
 * Xử lý Callback kết quả từ Builder Worker
 */
const handleBuilderCallback = async (callbackData) => {
  const { jobId, imageTag, success, logs, error } = callbackData;

  // 1. Trường hợp Build thất bại
  if (!success) {
    console.error(`[BuildJobService] Job [${jobId}] Build thất bại:`, error);
    await Job.findOneAndUpdate(
      { jobId },
      { $set: { status: "FAILED", logs: error || logs } },
      { returnDocument: "after" },
    );
    return {
      success: false,
      message: "Đã ghi nhận trạng thái Build thất bại.",
    };
  }

  console.log(
    `[BuildJobService] Job [${jobId}] Build thành công. Tag: ${imageTag}`,
  );

  // 2. Tìm Deploy Worker phù hợp nhất từ DB (Hỗ trợ tìm cả role "DEPLOY" lẫn "DEPLOYER")
  const targetDeployWorker = await Workers.findOne({
    role: { $in: ["DEPLOY", "DEPLOYER"] },
    status: "READY",
  }).sort({ active_jobs_count: 1, totalRamMb: -1 });

  // 🟢 SỬA LỖI CRASH SERVER: Thêm return ngay nếu không tìm thấy Deploy Worker
  if (!targetDeployWorker) {
    const fallbackJob = await Job.findOneAndUpdate(
      { jobId },
      { $set: { status: "BUILT", imageTag, logs } },
      { returnDocument: "after" },
    );
    console.warn(
      `[BuildJobService] Job [${jobId}] đã lưu trạng thái BUILT nhưng chưa có Deploy Worker sẵn sàng.`,
    );
    return {
      success: true,
      message: "Đã lưu trạng thái BUILT, chờ Deploy Worker rảnh.",
      job: fallbackJob,
    };
  }

  // 3. Gán Job cho Deploy Worker vừa tìm được & chuyển trạng thái DEPLOY_PENDING
  const updatedJob = await Job.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status: "DEPLOY_PENDING",
        imageTag,
        logs,
        assigned_worker_id: targetDeployWorker.worker_id,
        assigned_at: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  console.log(
    `[BuildJobService] Đã gán Job [${jobId}] cho Deploy Worker [${targetDeployWorker.worker_id}] chờ lấy việc.`,
  );

  return {
    success: true,
    message: "Đã nhận kết quả Build và phân công Deploy Worker thành công.",
    assigned_worker: targetDeployWorker.worker_id,
  };
};

/**
 * Deploy Worker gọi Polling mỗi 5s để lấy Job dành riêng cho mình
 */
const getDeployJobForWorker = async (worker_id) => {
  const job = await Job.findOneAndUpdate(
    { assigned_worker_id: worker_id, status: "DEPLOY_PENDING" },
    { $set: { status: "DEPLOYING" } },
    { sort: { assignedt: 1 }, returnDocument: "after" },
  );

  return job;
};

/**
 * Deploy Worker hoàn tất nhiệm vụ -> Lưu thông tin Container/URL & cập nhật COMPLETED / DEPLOY_FAILED
 */
const completeAndRemoveJob = async (payload) => {
  // Hỗ trợ cả trường hợp truyền Object payload hoặc chuỗi jobId đơn thuần
  const jobId = typeof payload === "string" ? payload : payload.jobId;
  const {
    success = true,
    containerId,
    port,
    publicUrl,
    logs,
    error,
  } = payload || {};

  const status = success ? "COMPLETED" : "DEPLOY_FAILED";

  return await App.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status,
        containerId,
        port,
        publicUrl,
        completedAt: new Date(),
        ...(logs && { logs }),
        ...(error && { error }),
      },
    },
    { returnDocument: "after" },
  );
};

/**
 * Watchdog: Tự động đổi Deploy Worker nếu quá hạn mà Worker cũ không tới lấy Job
 */
const reassignTimedOutDeployJobs = async (timeoutSeconds = 30) => {
  const timeoutThreshold = new Date(Date.now() - timeoutSeconds * 1000);

  const timedOutJobs = await Job.find({
    status: "DEPLOY_PENDING",
    assigned_at: { $lt: timeoutThreshold },
  });

  for (const job of timedOutJobs) {
    console.warn(
      `[⚠️ TIMEOUT] Deploy Worker [${job.assigned_worker_id}] quá hạn nhận Job [${job.jobId}]`,
    );

    // Đánh dấu Worker cũ có vấn đề
    await Workers.findOneAndUpdate(
      { worker_id: job.assigned_worker_id },
      { $set: { status: "OFFLINE" } },
      { returnDocument: "after" },
    );

    // Tìm Deploy Worker mới thay thế
    const newWorker = await Workers.findOne({
      role: { $in: ["DEPLOY", "DEPLOYER"] },
      status: "READY",
      worker_id: { $ne: job.assigned_worker_id },
    }).sort({ active_jobs_count: 1 });

    if (newWorker) {
      console.log(
        `[🔄 FAILOVER] Chuyển Job [${job.job_id}] sang Worker mới: [${newWorker.worker_id}]`,
      );
      job.assigned_worker_id = newWorker.worker_id;
      job.assigned_at = new Date();
      await job.save();
    } else {
      console.error(
        `[❌ FAILOVER FAILED] Không có Deploy Worker nào thay thế cho Job [${job.jobId}]`,
      );
    }
  }
};

module.exports = {
  createBuildJob,
  getNextJob,
  handleBuilderCallback,
  getDeployJobForWorker,
  completeAndRemoveJob,
  reassignTimedOutDeployJobs,
};
