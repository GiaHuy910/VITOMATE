module.exports = {
  MASTER_URL: process.env.MASTER_URL || "http://192.168.1.8:4000",
  WORKER_ID: process.env.WORKER_ID || "deploy-worker-01",
  ROLE: "DEPLOYER", // Định danh loại Worker cho Master
  POLL_INTERVAL: parseInt(process.env.POLL_INTERVAL, 10) || 5000,
};
