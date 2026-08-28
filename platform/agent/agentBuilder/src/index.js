const config = require("./config/config");
const { pollMaster } = require("./services/api");
const { handleJob } = require("./services/executor");
const { reportJobResultToMaster } = require("./services/api");

console.log(
  `🤖 Agent [${config.WORKER_ID}] đã khởi chạy. Kết nối tới Master: ${config.MASTER_URL}`,
);

async function tick() {
  try {
    const job = await pollMaster();
    if (job) {
      console.log(`[📥 LỆNH MỚI TỪ MASTER]:`, job);

      // 1. Hứng kết quả trả về từ handleJob
      const result = await handleJob(job);

      // 2. Gửi báo cáo kết quả (thành công/thất bại + logs) về cho Master
      await reportJobResultToMaster(result);
    }
  } catch (err) {
    console.error(`[⚠️ LỖI AGENT]: ${err.message}`);
  }
}

// Chạy ngay lập tức và lập lịch polling
tick();
setInterval(tick, config.POLL_INTERVAL);
