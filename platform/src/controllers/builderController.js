const buildJobService = require("../services/buildJobService");
const Job = require("../models/Job");
const App = require("../models/App");

/**
 * Controller xử lý khi Builder Worker Agent gọi GET /api/builders/poll
 */
const pollJob = async (req, res) => {
  try {
    const worker_id = req.query.worker_id;

    // Lấy Job tiếp theo trong hàng chờ
    const Job = await buildJobService.getNextJob();

    if (!Job) {
      // Không có việc -> Trả về 204 No Content
      return res.status(204).end();
    }

    console.log(
      `[Platform Master] Đã giao Job ${Job.job_id} cho Builder Worker: ${worker_id}`,
    );

    return res.status(200).json(Job);
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
    const { app_id, deployment_order, owner, name, branch, env_vars } =
      req.body;
    if (!app_id || !deployment_order || !owner || !name) {
      return res.status(400).json({
        success: false,
        error:
          "Thiếu thông tin bắt buộc: app_id, deployment_order, owner, name, env_vars.",
      });
    }

    newJobPayload = await buildJobService.createBuildJob({
      app_id: app_id,
      deployment_order: deployment_order,
      owner: owner,
      name: name,
      branch: branch || "main",
      env_vars: env_vars || {},
    });

    console.log(
      `[Platform] Đã tiếp nhận Project [${app_id}], đẩy Job ${newJobPayload.job_id} vào Queue.`,
    );

    return res.status(200).json({
      success: true,
      message:
        "Khởi tạo Project thành công, tác vụ Build đã được đưa vào hàng đợi.",
      job_id: newJobPayload.job_id,
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
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin job_id trong payload callback.",
      });
    }

    // Chuyển toàn bộ xử lý nghiệp vụ cho buildjobService
    const result = await buildJobService.handleBuilderCallback(req.body);

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
