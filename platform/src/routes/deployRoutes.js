const express = require("express");
const router = express.Router();
const deployController = require("../controllers/deployController");

// Route cho Long Polling
router.get("/poll", deployController.pollJob);

router.post("/complete", deployController.completeJob);

module.exports = router;
