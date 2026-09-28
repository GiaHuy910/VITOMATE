module.exports = {
  MASTER_URL: process.env.MASTER_URL,
  REGISTRY_URL: process.env.REGISTRY_URL,
  WORKER_ID: process.env.WORKER_ID,
  WORKER_HOST: process.env.WORKER_HOST,
  AGENT_ROLE: process.env.AGENT_ROLE,
  AGENT_TOKEN: process.env.AGENT_TOKEN,

  APPS_DIR: "/opt/agent/apps",

  POLL_INTERVAL: parseInt(process.env.POLL_INTERVAL, 10) || 5000,
};
