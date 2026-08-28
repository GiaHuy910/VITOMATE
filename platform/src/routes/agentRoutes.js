const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agentController");

// Route để Agent gọi lên lấy lệnh
router.get("/poll", agentController.handlePoll);

// Route để Agent gửi báo cáo lỗi
router.post("/error", agentController.handleReportError);

module.exports = router;
