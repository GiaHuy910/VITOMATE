const express = require("express");

const agentController = require("../controllers/agent.controller");

const router = express.Router();

router.post("/register", agentController.registerAgent);

module.exports = router;
