const express = require("express");
const router = express.Router();
const provisionController = require("../controllers/provisionController");
const workerController = require("../controllers/workerController");

// API kích hoạt SSH Bootstrap
router.post("/bootstrap", provisionController.bootstrapworker);

// API đăng ký Worker Node
router.post("/register", workerController.registerWorker);

// API xem danh sách Worker Node
router.get("/:id", workerController.getWorkers);
router.get("/", workerController.getWorkers);

module.exports = router;
