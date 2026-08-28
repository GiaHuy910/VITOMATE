const config = require("./agent/config");
const { pollMaster } = require("./agent/api");
const { handleJob } = require("./agent/executor");

console.log(
  `🤖 Agent [${config.WORKER_ID}] đã khởi chạy. Kết nối tới Master: ${config.MASTER_URL}`,
);

async function tick() {
  try {
    const job = await pollMaster();
    if (job) {
      console.log(`[📥 LỆNH MỚI TỪ MASTER]:`, job);
      await handleJob(job);
    }
  } catch (err) {
    console.error(`[⚠️ LỖI AGENT]: ${err.message}`);
  }
}

// Chạy ngay lập tức và lập lịch polling
tick();
setInterval(tick, config.POLL_INTERVAL);
