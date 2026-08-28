const jobService = require("../services/buildJobService");

/**
 * GET /api/deploys/poll?worker_id=xxx
 * Deploy Worker gọi mỗi 5s để lấy Job dành riêng cho mình
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
      `[Platform Master] Đã giao Deploy Job [${job.jobId}] cho Deploy Worker: ${worker_id}`,
    );

    return res.status(200).json({ success: true, job });
  } catch (error) {
    console.error("[❌ DEPLOY POLL ERROR]:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/deploys/complete
 * Deploy Worker gọi khi kéo Image và khởi chạy Container thành công
 */
const completeJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, error: "Thiếu jobId" });
    }

    const updatedJob = await jobService.completeAndRemoveJob(jobId);

    console.log(`[Platform Master] Job [${jobId}] đã hoàn tất thành công!`);

    return res.status(200).json({
      success: true,
      message: "Đã cập nhật trạng thái Job thành COMPLETED.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("[❌ COMPLETE JOB ERROR]:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  pollJob,
  completeJob,
};
