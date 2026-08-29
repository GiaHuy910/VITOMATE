const config = require("./config/config");
const api = require("./services/api");
const { handleJob } = require("./services/executor");

console.log(`[🚀 AGENT DEPLOY] Khởi chạy Deploy Agent [${config.AGENT_ID}]...`);
console.log(`[🔗 AGENT DEPLOY] Kết nối tới Master: ${config.MASTER_URL}`);

let isProcessing = false;

async function tick() {
  // Nếu đang xử lý 1 Job Deploy thì bỏ qua đợt Poll này để tránh chồng việc
  if (isProcessing) return;

  try {
    const job = await api.pollMaster();

    if (job) {
      isProcessing = true;
      console.log(`[📥 LỆNH MỚI TỪ MASTER]:`, job);

      // 1. Thực thi Deploy Container
      const result = await handleJob(job);

      // 2. Lấy jobId từ result hoặc từ job ban đầu
      const targetJobId = result.jobId || job.jobId || job.id;

      // 3. Gửi báo cáo kết quả + URL truy cập về Master
      await api.reportJobResultToMaster(targetJobId, result);
    }
  } catch (err) {
    console.error("[❌ LOOP ERROR]:", err.message);
  } finally {
    isProcessing = false;
  }
}
tick();
// Bắt đầu vòng lặp Poll công việc từ Master
setInterval(tick, config.POLL_INTERVAL);
