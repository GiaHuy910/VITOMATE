const config = require("./config");
const api = require("./api");
const { handleJob } = require("./executor");

console.log(`[🚀 AGENT DEPLOY] Khởi chạy Deploy Agent [${config.AGENT_ID}]...`);
console.log(`[🔗 AGENT DEPLOY] Kết nối tới Master: ${config.MASTER_URL}`);

let isProcessing = false;

async function pollLoop() {
  if (isProcessing) return;

  try {
    const response = await api.fetchNextJob();
    if (response && response.job) {
      const job = response.job;
      isProcessing = true;
      console.log(`[📥 LỆNH MỚI TỪ MASTER]:`, job);

      const result = await handleJob(job);
      await api.submitJobResult(job.id, result);
    }
  } catch (err) {
    console.error("[❌ LOOP ERROR]:", err.message);
  } finally {
    isProcessing = false;
  }
}

// Bắt đầu vòng lặp Poll công việc từ Master
setInterval(pollLoop, config.POLL_INTERVAL);
