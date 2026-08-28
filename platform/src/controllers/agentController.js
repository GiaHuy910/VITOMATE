const vmManager = require("../vm/vmManager");

class AgentController {
  /**
   * API Endpoint: GET /api/worker/poll?worker_id=xxx
   * Agent sẽ gọi API này mỗi 5 giây
   */
  handlePoll(req, res) {
    const { worker_id } = req.query;

    if (!worker_id) {
      return res.status(400).json({ error: "Thiếu worker_id" });
    }

    // 1. Cập nhật trạng thái "Sống" cho Máy ảo
    vmManager.updateHeartbeat(worker_id);

    // 2. Kiểm tra xem Master có lệnh nào đang đợi gửi cho Máy ảo này không
    const command = vmManager.getPendingCommand(worker_id);

    if (command) {
      // Có lệnh -> Mới trả về JSON cho Agent thực thi
      return res.status(200).json(command);
    }

    // Không có lệnh mới -> Trả về 204 No Content
    return res.status(204).send();
  }

  /**
   * API Endpoint: POST /api/worker/error
   * Nhận báo cáo lỗi từ Agent
   */
  handleReportError(req, res) {
    const { worker_id, action, error_msg, timestamp } = req.body;

    console.error(`\n🚨 [ALERT ERROR FROM WORKER: ${worker_id}]`);
    console.error(`- Hành động bị lỗi: ${action}`);
    console.error(`- Chi tiết lỗi: ${error_msg}`);
    console.error(`- Thời gian: ${timestamp}\n`);

    // Lưu log lỗi này vào database hoặc thông báo lên Dashboard
    return res.status(200).json({ status: "Error Log Received" });
  }
}

module.exports = new AgentController();
