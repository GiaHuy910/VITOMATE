const agentService = require("../services/agent.service");

function registerAgent(req, res) {
  try {
    const agent = agentService.registerAgent(req.body);

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error(error);

    res.status(501).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  registerAgent,
};
