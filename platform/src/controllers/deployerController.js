const jobService = require("../services/buildJobService");

/**
 * GET /api/deployers/poll?worker_id=xxx
 * Deployer Worker gọi mỗi 5s để lấy Job dành riêng cho mình
 */
const pollJob = async (req, res) => {
  try {
    const { worker_id } = req.query;

    if (!worker_id) {
      return res.status(400).json({ success: false, error: "Thiếu worker_id" });
    }

    const job = await jobService.getDeployJobForWorker(worker_id);

    if (!job) {
      // Không có việc -> Trả về 204 No Content
      return res.status(204).end();
    }

    console.log(
      `[Platform Master] Đã giao Deploy Job [${job.jobId}] cho Deployer Worker: ${worker_id}`,
    );

    return res.status(200).json({ success: true, job });
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
    const { jobId, success, error } = req.body;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, error: "Thiếu jobId trong payload" });
    }

    // 🟢 Truyền toàn bộ payload (bao gồm publicUrl, port, containerId, logs) vào Service
    const updatedJob = await jobService.completeAndRemoveJob(req.body);

    console.log(
      `[Platform Master] Job [${jobId}] hoàn tất! Trạng thái: ${success ? "SUCCESS" : "FAILED"}`,
    );

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật trạng thái Job thành công.",
      job: updatedJob,
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
