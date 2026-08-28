const Job = require("../models/job");
const Worker = require("../models/Workers");

/**
 * 1. Callback từ Builder: Gán Job cho 1 Deploy Worker cụ thể
 */
const handleBuilderCallback = async (callbackData) => {
  const { jobId, imageTag, success, logs, error } = callbackData;

  if (!success) {
    await Job.findOneAndUpdate(
      { jobId },
      { $set: { status: "FAILED", logs: error || logs } },
    );
    return {
      success: false,
      message: "Đã ghi nhận trạng thái Build thất bại.",
    };
  }

  // Chọn Deploy Worker rảnh nhất
  const targetDeployWorker = await Worker.findOne({
    role: "DEPLOY",
    status: "READY",
  }).sort({ activeJobsCount: 1, totalRamMb: -1 });

  if (!targetDeployWorker) {
    throw new Error("Không có Deploy Worker nào khả dụng!");
  }

  // Cập nhật Job ở trạng thái chờ Deploy Worker vào nhận (Gán ID + Mốc thời gian)
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

  return {
    success: true,
    message: `Đã phân công Job [${jobId}] cho Deploy Worker [${targetDeployWorker.workerId}] chờ lấy việc.`,
  };
};

/**
 * 2. Deploy Worker Poll lấy Job dành riêng cho mình
 */
const getDeployJobForWorker = async (workerId) => {
  // Tìm Job dành cho workerId này và chuyển status sang DEPLOYING
  const job = await Job.findOneAndUpdate(
    { assignedWorkerId: workerId, status: "DEPLOY_PENDING" },
    { $set: { status: "DEPLOYING" } },
    { sort: { assignedAt: 1 }, new: true },
  );

  return job;
};

/**
 * 3. Worker gọi hàm báo hoàn tất (hoặc xóa Job)
 */
const completeAndRemoveJob = async (jobId) => {
  // Có thể xóa hẳn (Job.deleteOne) hoặc giữ lại lưu lịch sử với status COMPLETED
  return await Job.findOneAndUpdate(
    { jobId },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
  );
};

/**
 * 4. Watchdog: Tự động đổi Worker nếu quá hạn không lấy Job (Re-assign Timeout)
 */
const reassignTimedOutDeployJobs = async (timeoutSeconds = 30) => {
  const timeoutThreshold = new Date(Date.now() - timeoutSeconds * 1000);

  // Tìm các Job quá hạn mà Worker chưa đến lấy
  const timedOutJobs = await Job.find({
    status: "DEPLOY_PENDING",
    assignedAt: { $lt: timeoutThreshold },
  });

  for (const job of timedOutJobs) {
    console.warn(
      `[⚠️ TIMEOUT] Deploy Worker [${job.assignedWorkerId}] quá hạn nhận Job [${job.jobId}]`,
    );

    // 1. Đánh dấu Worker cũ bị OFFLINE / WARNING
    await Worker.findOneAndUpdate(
      { workerId: job.assignedWorkerId },
      { $set: { status: "OFFLINE" } },
    );

    // 2. Tìm Deploy Worker mới
    const newWorker = await Worker.findOne({
      role: "DEPLOY",
      status: "READY",
      workerId: { $ne: job.assignedWorkerId }, // Loại trừ worker hỏng
    }).sort({ activeJobsCount: 1 });

    if (newWorker) {
      console.log(
        `[🔄 FAILOVER] Đổi Job [${job.jobId}] sang Worker mới: [${newWorker.workerId}]`,
      );
      job.assignedWorkerId = newWorker.workerId;
      job.assignedAt = new Date();
      await job.save();
    } else {
      console.error(
        `[❌ FAILOVER FAILED] Không tìm thấy Worker thay thế cho Job [${job.jobId}]`,
      );
    }
  }
};

module.exports = {
  handleBuilderCallback,
  getDeployJobForWorker,
  completeAndRemoveJob,
  reassignTimedOutDeployJobs,
};
