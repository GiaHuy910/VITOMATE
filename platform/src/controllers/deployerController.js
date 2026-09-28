const buildJobService = require("../services/buildJobService");
const deployJobService = require("../services/deployJobService");

/**
 * GET /api/deployers/poll?worker_id=xxx
 * Deployer Worker gọi mỗi 5s để lấy Job dành riêng cho mình
 */
const pollJob = async (req, res) => {
  try {
    const worker_id = req.query.worker_id;

    if (!worker_id) {
      return res.status(400).json({ success: false, error: "Thiếu worker_id" });
    }

    const job = await deployJobService.getDeployJobForWorker(worker_id);

    if (!job) {
      return res.status(204).end();
    }

    console.log(
      `[Platform Master] Đã giao Deploy Job [${job.job_id}] cho Deployer Worker: ${worker_id}`,
    );

    return res.status(200).json(job);
  } catch (error) {
    console.error("[❌ DEPLOY POLL ERROR]:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/deployers/callback
 * Deployer Worker gọi khi kéo Image và khởi chạy Container thành công
 */
const callback = async (req, res) => {
  try {
    const {
      job_id,
      app_id,
      worker_id,
      container_port,
      public_url,
      deployment_order,
      branch,
      commit_hash,
      image_tag,
      env_vars,
      success,
      error,
    } = req.body;

    console.log("job_id: ", job_id);

    if (!job_id) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu job_id trong payload" });
    }

    const updateAppAndRemoveJob = await deployJobService.handleDeployerCallback(
      {
        job_id,
        app_id,
        worker_id,
        container_port,
        public_url,
        deployment_order,
        branch,
        commit_hash,
        image_tag,
        env_vars,
        success,
        error,
      },
    );

    console.log(
      `[Platform Master] Job hoàn tất! Trạng thái: ${success ? "SUCCESS" : "FAILED"}`,
    );

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật trạng thái App thành công.",
    });
  } catch (error) {
    console.error("[❌ COMPLETE JOB ERROR]:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  pollJob,
  callback,
};
