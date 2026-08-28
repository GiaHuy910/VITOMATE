const jobService = require("../services/buildJobService");
const Job = require("../models/job"); // Bổ sung import Job Model

/**
 * Controller xử lý khi Builder Worker Agent gọi GET /api/builders/poll
 */
const pollJob = async (req, res) => {
  try {
    const { worker_id } = req.query;

    // Lấy Job tiếp theo trong hàng chờ
    const job = await jobService.getNextJob();

    if (!job) {
      // Không có việc -> Trả về 204 No Content
      return res.status(204).end();
    }

    console.log(
      `[Platform Master] Đã giao Job ${job.id} cho Builder Worker: ${worker_id}`,
    );

    return res.status(200).json(job);
  } catch (error) {
    console.error("[❌ POLL JOB ERROR]:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API Khởi tạo Project và đẩy Job Build cho builder Worker
 * POST /api/builders/init
 */
const initProject = async (req, res) => {
  try {
    const { repo_id, owner, name, branch } = req.body;

    // Validate dữ liệu truyền lên
    if (!repo_id || !owner || !name) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc: repo_id, owner hoặc name.",
      });
    }

    // 1. THÊM AWAIT Ở ĐÂY để lấy đúng Object Job từ DB
    const newJobPayload = await jobService.createBuildJob({
      repo_id: repo_id,
      owner: owner,
      name: name,
      branch: branch || "main",
    });

    console.log(
      `[Platform] Đã tiếp nhận Project [${repo_id}], đẩy Job ${newJobPayload.id} vào Queue.`,
    );

    return res.status(200).json({
      success: true,
      message:
        "Khởi tạo Project thành công, tác vụ Build đã được đưa vào hàng đợi.",
      jobId: newJobPayload.id,
    });
  } catch (error) {
    console.error("[❌ INIT PROJECT ERROR]:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Khởi tạo Project thất bại.",
    });
  }
};

/**
 * Callback nhận báo cáo kết quả Build từ Builder Worker
 * POST /api/builders/callback
 */
const callback = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin jobId trong payload callback.",
      });
    }

    // Chuyển toàn bộ xử lý nghiệp vụ cho jobService
    const result = await jobService.handleBuilderCallback(req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error(`[❌ BUILDER CALLBACK ERROR]:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Xử lý callback từ Builder thất bại.",
    });
  }
};

/**
 * Lấy danh sách toàn bộ Job
 * GET /api/builders/jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  pollJob,
  initProject,
  callback,
  getAllJobs,
};
