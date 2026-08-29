const express = require("express");
const router = express.Router();
const deployerController = require("../controllers/deployerController");

// Route cho Long Polling
router.get("/poll", deployerController.pollJob);

router.post("/callback", deployerController.callback);

module.exports = router;
