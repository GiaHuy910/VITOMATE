const Job = require("../models/Job");
const Worker = require("../models/Worker");
const Config = require("../config/config");
const GetNextJobId = require("../utils/getNextJobId");

/**
 * Tạo Build Job mới và lưu vào MongoDB
 */
async function createBuildJob({
  app_id,
  deployment_order,
  owner,
  name,
  branch,
  env_vars,
}) {
  const job_id = await GetNextJobId.getNextJobId();

  const image_tag = `${Config.registry.url}/apps/${app_id}:${deployment_order}`;

  const newJob = await Job.create({
    job_id: job_id,
    app_id: app_id,
    deployment_order: deployment_order,
    owner,
    app_name: name,
    branch: branch || "main",
    env_vars: env_vars || {},
    image_tag: image_tag,
    status: "PENDING",
  });

  console.log(`[Platform Queue] Đã thêm Job mới vào DB: ${newJob.job_id}`);

  return {
    job_id: newJob.job_id,
    type: "BUILD_AND_PACK",
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

  return job;
}

/**
 * Xử lý Callback kết quả từ Builder Worker
 */
const handleBuilderCallback = async (callbackData) => {
  const { job_id, image_tag, success, logs, error } = callbackData;

  // 1. Trường hợp Build thất bại
  if (!success) {
    console.error(`[BuildJobService] Job [${job_id}] Build thất bại:`, error);
    await Job.findOneAndUpdate(
      { job_id },
      { $set: { status: "FAILED", logs: error } },
      { returnDocument: "after" },
    );
    return {
      success: false,
      message: "Đã ghi nhận trạng thái Build thất bại.",
    };
  }

  console.log(`[BuildJobService] Job [${job_id}] Build thành công.`);

  // 2. Tìm Deploy Worker phù hợp nhất từ DB
  const targetDeployWorker = await Worker.findBestAvailable("DEPLOYER");

  if (!targetDeployWorker) {
    const fallbackJob = await Job.findOneAndUpdate(
      { job_id },
      { $set: { status: "BUILT", image_tag, logs } },
      { returnDocument: "after" },
    );
    console.warn(
      `[BuildJobService] Job [${job_id}] đã lưu trạng thái BUILT nhưng chưa có Deploy Worker sẵn sàng.`,
    );
    return {
      success: true,
      message: "Đã lưu trạng thái BUILT, chờ Deploy Worker rảnh.",
      job: fallbackJob,
    };
  }

  // 3. Gán Job cho Deploy Worker vừa tìm được & chuyển trạng thái DEPLOY_PENDING
  const workerIdentifier = targetDeployWorker.worker_id;

  const updatedJob = await Job.findOneAndUpdate(
    { job_id },
    {
      $set: {
        status: "DEPLOY_PENDING",
        image_tag,
        logs,
        assigned_worker_id: workerIdentifier,
        assigned_at: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  console.log(
    `[BuildJobService] Đã gán Job [${job_id}] cho Deploy Worker [${workerIdentifier}] chờ lấy việc.`,
  );

  return {
    success: true,
    message: "Đã nhận kết quả Build và phân công Deploy Worker thành công.",
    assigned_worker: workerIdentifier,
  };
};

module.exports = {
  createBuildJob,
  getNextJob,
  handleBuilderCallback,
};
