const workerService = require("../services/workerService");

const registerWorker = async (req, res) => {
  try {
    const { workerId, ip, role } = req.body;

    if (!workerId || !ip || !role) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: workerId, ip hoặc role!",
      });
    }

    // Gọi service xử lý logic
    const updatedWorker = await workerService.upsertWorker(req.body);

    console.log(
      `[MongoDB] 🟢 Đã đăng ký/cập nhật Worker [${role}]: ${workerId} (${ip})`,
    );

    return res.status(200).json({
      success: true,
      message: "Đăng ký thông tin Worker thành công!",
      data: updatedWorker,
    });
  } catch (error) {
    console.error("[MongoDB Error] Lỗi đăng ký Worker:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getWorkers = async (req, res) => {
  try {
    const workerId = req.params.id || req.query.id;

    // Trường hợp 1: Lấy Worker theo ID
    if (workerId) {
      const worker = await workerService.getWorkerById(workerId);

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy Worker với ID: ${workerId}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: worker,
      });
    }

    // Trường hợp 2: Lấy toàn bộ danh sách Workers
    const workers = await workerService.getAllWorkers();

    return res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    console.error("[MongoDB Error] Lỗi lấy thông tin Worker:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = { registerWorker, getWorkers };
