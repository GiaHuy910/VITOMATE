// platform/src/routes/builderRoutes.js
const express = require("express");
const router = express.Router();
const builderController = require("../controllers/builderController");

// Route cho Long Polling
router.get("/poll", builderController.pollJob);
// POST /api/builders/init
router.post("/init", builderController.initProject);

router.post("/callback", builderController.callback);

router.get("/jobs", builderController.getAllJobs);

module.exports = router;
