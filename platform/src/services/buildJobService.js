const Job = require("../models/job");
const Worker = require("../models/Workers");
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
      returnDocument: "after", // 🟢 Đã chuẩn hóa
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
      { returnDocument: "after" }, // 🟢 Đã chuẩn hóa
    );
    return {
      success: false,
      message: "Đã ghi nhận trạng thái Build thất bại.",
    };
  }

  console.log(
    `[BuildJobService] Job [${jobId}] Build thành công. Tag: ${imageTag}`,
  );

  // 2. Tìm Deploy Worker phù hợp nhất từ DB
  const targetDeployWorker = await Worker.findOne({
    role: { $in: ["DEPLOY", "DEPLOYER"] },
    status: "READY",
  }).sort({ activeJobsCount: 1, totalRamMb: -1 });

  // 🟢 ĐÃ SỬA: Thêm return để ngắt luồng, tránh lỗi null reference
  if (!targetDeployWorker) {
    const fallbackJob = await Job.findOneAndUpdate(
      { jobId },
      { $set: { status: "BUILT", imageTag, logs } },
      { returnDocument: "after" }, // 🟢 Đã chuẩn hóa
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
  const workerIdentifier = targetDeployWorker.workerId || targetDeployWorker.id;

  const updatedJob = await Job.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status: "DEPLOY_PENDING",
        imageTag,
        logs,
        assignedWorkerId: workerIdentifier,
        assignedAt: new Date(),
      },
    },
    { returnDocument: "after" }, // 🟢 Đã chuẩn hóa
  );

  console.log(
    `[BuildJobService] Đã gán Job [${jobId}] cho Deploy Worker [${workerIdentifier}] chờ lấy việc.`,
  );

  return {
    success: true,
    message: "Đã nhận kết quả Build và phân công Deploy Worker thành công.",
    assignedWorker: workerIdentifier,
  };
};

/**
 * Deploy Worker gọi Polling mỗi 5s để lấy Job dành riêng cho mình
 */
const getDeployJobForWorker = async (workerId) => {
  const job = await Job.findOneAndUpdate(
    { assignedWorkerId: workerId, status: "DEPLOY_PENDING" },
    { $set: { status: "DEPLOYING" } },
    { sort: { assignedAt: 1 }, returnDocument: "after" }, // 🟢 Đã chuẩn hóa
  );

  return job;
};

/**
 * Deploy Worker hoàn tất nhiệm vụ -> Cập nhật trạng thái Job & Đồng bộ vào app Schema
 */
const completeAndRemoveJob = async (payload) => {
  const jobId = typeof payload === "string" ? payload : payload.jobId;
  const {
    success = true,
    containerId,
    port,
    publicUrl,
    logs,
    error,
  } = payload || {};

  const jobStatus = success ? "COMPLETED" : "DEPLOY_FAILED";

  // 1. Cập nhật trạng thái Job
  const updatedJob = await Job.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status: jobStatus,
        completedAt: new Date(),
        ...(logs && { logs }),
        ...(error && { error }),
      },
    },
    { returnDocument: "after" },
  );

  if (!updatedJob) return null;

  // 2. Đồng bộ thông tin sang Schema App
  if (success) {
    await App.findOneAndUpdate(
      { repoId: updatedJob.repo_id, owner: updatedJob.owner },
      {
        $set: {
          appName: updatedJob.appName,
          branch: updatedJob.branch,
          containerId,
          imageTag: updatedJob.imageTag,
          hostPort: port || updatedJob.hostPort,
          containerPort: updatedJob.containerPort || 3000,
          publicUrl,
          workerId: updatedJob.assignedWorkerId,
          envVars: updatedJob.envVars,
          status: "RUNNING",
          lastJobId: jobId,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    console.log(
      `[🚀 APP SYNC] Đã cập nhật ứng dụng [${updatedJob.appName}] trạng thái RUNNING.`,
    );
  } else {
    await App.findOneAndUpdate(
      { repoId: updatedJob.repo_id, owner: updatedJob.owner },
      {
        $set: {
          status: "FAILED",
          lastJobId: jobId,
        },
      },
    );
  }

  return updatedJob;
};

/**
 * Watchdog: Tự động đổi Deploy Worker nếu quá hạn nhận Job
 */
const reassignTimedOutDeployJobs = async (timeoutSeconds = 30) => {
  const timeoutThreshold = new Date(Date.now() - timeoutSeconds * 1000);

  const timedOutJobs = await Job.find({
    status: "DEPLOY_PENDING",
    assignedAt: { $lt: timeoutThreshold },
  });

  for (const job of timedOutJobs) {
    console.warn(
      `[⚠️ TIMEOUT] Deploy Worker [${job.assignedWorkerId}] quá hạn nhận Job [${job.jobId}]`,
    );

    // Đánh dấu Worker cũ có vấn đề
    await Worker.findOneAndUpdate(
      { workerId: job.assignedWorkerId },
      { $set: { status: "OFFLINE" } },
      { returnDocument: "after" }, // 🟢 Đã chuẩn hóa
    );

    // Tìm Deploy Worker mới thay thế
    const newWorker = await Worker.findOne({
      role: { $in: ["DEPLOY", "DEPLOYER"] },
      status: "READY",
      workerId: { $ne: job.assignedWorkerId },
    }).sort({ activeJobsCount: 1 });

    if (newWorker) {
      console.log(
        `[🔄 FAILOVER] Chuyển Job [${job.jobId}] sang Worker mới: [${newWorker.workerId}]`,
      );
      job.assignedWorkerId = newWorker.workerId;
      job.assignedAt = new Date();
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
