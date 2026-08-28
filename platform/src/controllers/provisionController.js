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

    const workerRole = role.toUpperCase(); // BUILDER hoặc DEPLOY
    const prefix =
      workerRole === "BUILDER" ? "worker-builder" : "worker-deploy";

    // 2. Truy vấn DB tìm Worker có workerId tương ứng theo prefix để lấy số thứ tự lớn nhất
    const latestWorker = await Worker.findOne({
      workerId: new RegExp(`^${prefix}-\\d+$`, "i"),
    })
      .sort({ createdAt: -1 })
      .select("workerId");

    let nextNumber = 1;
    if (latestWorker && latestWorker.workerId) {
      const parts = latestWorker.workerId.split("-");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    // Định dạng số thứ tự thành 2 chữ số (VD: 01, 02, 09, 10...)
    const formattedNum = String(nextNumber).padStart(2, "0");
    const generatedWorkerId = `${prefix}-${formattedNum}`;

    console.log(`[*] Bắt đầu Bootstrap Worker worker: ${host}...`);
    const targetworker = await provisionService.bootstrapWorker(
      req.body,
      generatedWorkerId,
    );

    return res.status(200).json({
      success: true,
      message: `Cài đặt và kích hoạt Worker worker [${targetworker.id}] thành công!`,
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
