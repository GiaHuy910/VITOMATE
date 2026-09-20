const provisionService = require("../services/provisionService");
const Worker = require("../models/Workers");

/**
 * API Bootstrap một máy chủ mới trở thành Worker
 * POST /api/workers/bootstrap
 */
const bootstrapworker = async (req, res) => {
  try {
    const { host, username, password, role } = req.body;

    // Validate thông tin SSH bắt buộc
    if (!host || !username || !password) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin kết nối SSH: host, username, hoặc password.",
      });
    }

    console.log(`[*] Bắt đầu Bootstrap Worker: ${host}...`);
    const targetworker = await provisionService.bootstrapWorker(req.body);

    return res.status(200).json({
      success: true,
      message: `Cài đặt và kích hoạt Worker [${targetworker.id}] thành công!`,
      worker: {
        id: targetworker.id,
        host: targetworker.host,
        status: "BOOTSTRAPPING",
      },
    });
  } catch (error) {
    console.error("[❌ BOOTSTRAP API ERROR]:", error.message || error);
    return res.status(500).json({
      success: false,
      error: error.message || "Bootstrap máy chủ thất bại.",
    });
  }
};

module.exports = {
  bootstrapworker,
};
