const Job = require("../models/job");
const Worker = require("../models/Workers");

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

  // Trả về định dạng payload tương thích với Builder Worker
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
  // Tìm Job cũ nhất đang PENDING và cập nhật ngay sang BUILDING
  const job = await Job.findOneAndUpdate(
    { status: "PENDING" },
    { $set: { status: "BUILDING" } },
    {
      sort: { createdAt: 1 },
      returnDocument: "after", // Thay thế cho { new: true }
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
    );
    return {
      success: false,
      message: "Đã ghi nhận trạng thái Build thất bại.",
    };
  }

  console.log(
    `[BuildJobService] Job [${jobId}] Build thành công. Tag: ${imageTag}`,
  );

  // 2. Tìm Deploy Worker phù hợp nhất từ DB (rảnh việc nhất)
  const targetDeployWorker = await Worker.findOne({
    role: "DEPLOY",
    status: "READY",
  }).sort({ activeJobsCount: 1, totalRamMb: -1 });

  if (!targetDeployWorker) {
    // Nếu không có Deploy Worker rảnh, vẫn lưu trạng thái BUILT để chờ gán sau
    await Job.findOneAndUpdate(
      { jobId },
      { $set: { status: "BUILT", imageTag, logs } },
    );
    console.warn(
      `[BuildJobService] Job [${jobId}] đã lưu trạng thái BUILT nhưng chưa có Deploy Worker sẵn sàng.`,
    );
  }

  // 3. Gán Job cho Deploy Worker vừa tìm được & chuyển trạng thái DEPLOY_PENDING
  const updatedJob = await Job.findOneAndUpdate(
    { jobId },
    {
      $set: {
        status: "DEPLOY_PENDING",
        imageTag,
        logs,
        assignedWorkerId: targetDeployWorker.workerId,
        assignedAt: new Date(),
      },
    },
    { new: true },
  );

  console.log(
    `[BuildJobService] Đã gán Job [${jobId}] cho Deploy Worker [${targetDeployWorker.workerId}] chờ lấy việc.`,
  );

  return {
    success: true,
    message: "Đã nhận kết quả Build và phân công Deploy Worker thành công.",
    assignedWorker: targetDeployWorker.workerId,
  };
};

/**
 * Deploy Worker gọi Polling mỗi 5s để lấy Job dành riêng cho mình
 */
const getDeployJobForWorker = async (workerId) => {
  const job = await Job.findOneAndUpdate(
    { assignedWorkerId: workerId, status: "DEPLOY_PENDING" },
    { $set: { status: "DEPLOYING" } },
    { sort: { assignedAt: 1 }, new: true },
  );

  return job;
};

/**
 * Deploy Worker hoàn tất nhiệm vụ -> Xóa Job khỏi DB (hoặc cập nhật status COMPLETED)
 */
const completeAndRemoveJob = async (jobId) => {
  // Bạn có thể dùng Job.deleteOne({ jobId }) nếu muốn xóa hẳn
  return await Job.findOneAndUpdate(
    { jobId },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
    { new: true },
  );
};

/**
 * Watchdog: Tự động đổi Deploy Worker nếu quá hạn (ví dụ: 30s) mà Worker cũ không tới lấy Job
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
    );

    // Tìm Deploy Worker mới thay thế
    const newWorker = await Worker.findOne({
      role: "DEPLOY",
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
