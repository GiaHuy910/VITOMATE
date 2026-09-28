const Job = require("../models/Job");
const Worker = require("../models/Worker");
const App = require("../models/App");

/**
 * Xử lý Callback kết quả từ deployer Worker
 */
const handleDeployerCallback = async (payload) => {
  const {
    job_id,
    app_id,
    worker_id,
    container_port,
    public_url,
    deployment_order,
    branch = "main",
    commit_hash,
    image_tag,
    env_vars,
    success,
    error,
  } = payload;

  console.log(payload);

  console.log("job_id: ", job_id);

  // 1. Kiểm tra Job có tồn tại không
  const job = await Job.findOne({ job_id });

  if (!job) {
    console.warn(`[JOB] Không tìm thấy Job [${job_id}] để hoàn tất.`);
    return null;
  }

  // 2. Nếu Deploy thất bại
  if (!success) {
    console.error(`[DEPLOY FAILED] Job [${job_id}] Deploy thất bại:`, error);

    // Job chỉ tồn tại trong quá trình deploy -> xóa sau khi xử lý
    await Job.deleteOne({ job_id });

    return {
      success: false,
      job_id,
      message: "Deploy thất bại. Job đã được xóa.",
      error,
    };
  }

  // 3. Deploy thành công -> đồng bộ thông tin vào App
  const updatedApp = await App.findOneAndUpdate(
    { app_id },
    {
      $set: {
        worker_id,
        container_port,
        public_url,
      },

      $push: {
        deployments: {
          deployment_order,
          branch,
          commit_hash,
          image_tag,
          job_id,
          env_vars: env_vars || {},
          status: "RUNNING",
        },
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  if (!updatedApp) {
    console.error(`[APP SYNC FAILED] Không thể cập nhật App [${app_id}].`);

    return null;
  }

  console.log(
    `[APP SYNC] App [${app_id}] deployment #${deployment_order} đang RUNNING.`,
  );

  // 4. App đã lưu thành công -> xóa Job
  await Job.deleteOne({ job_id });

  console.log(
    `[JOB CLEANUP] Đã xóa Job [${job_id}] sau khi deploy thành công.`,
  );

  return {
    success: true,
    app: updatedApp,
  };
};

/**
 * Deploy Worker gọi Polling mỗi 5s để lấy Job dành riêng cho mình
 */
const getDeployJobForWorker = async (worker_id) => {
  const job = await Job.findOneAndUpdate(
    { assigned_worker_id: worker_id, status: "DEPLOY_PENDING" },
    { $set: { status: "DEPLOYING" } },
    { sort: { assigned_at: 1 }, returnDocument: "after" },
  );

  return job;
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
      `[⚠️ TIMEOUT] Deploy Worker [${job.assigned_worker_id}] quá hạn nhận Job [${job.job_id}]`,
    );

    // Đánh dấu Worker cũ có vấn đề
    await Worker.findOneAndUpdate(
      { worker_id: job.assigned_worker_id },
      { $set: { status: "OFFLINE" } },
      { returnDocument: "after" },
    );

    // Tìm Deploy Worker mới thay thế
    const newWorker = await Worker.findOne({
      role: { $in: ["DEPLOYER", "DEPLOYER"] },
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
        `[❌ FAILOVER FAILED] Không có Deploy Worker nào thay thế cho Job [${job.job_id}]`,
      );
    }
  }
};

module.exports = {
  handleDeployerCallback,
  getDeployJobForWorker,
  reassignTimedOutDeployJobs,
};
