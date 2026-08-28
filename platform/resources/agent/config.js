module.exports = {
  MASTER_URL: process.env.MASTER_URL || "http://192.168.1.18:8000",
  WORKER_ID: process.env.WORKER_ID || "worker-node-01",
  POLL_INTERVAL: parseInt(process.env.POLL_INTERVAL, 10) || 5000,
};
