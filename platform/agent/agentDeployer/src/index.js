const config = require("./config/config");
const api = require("./services/api");
const { handleJob } = require("./services/executor");

console.log(`[🚀 AGENT DEPLOY] Khởi chạy Deploy Agent [${config.AGENT_ID}]...`);
console.log(`[🔗 AGENT DEPLOY] Kết nối tới Master: ${config.MASTER_URL}`);

async function runAgent() {
  while (true) {
    try {
      const job = await pollMaster();

      if (job) {
        console.log(`[📥 LỆNH MỚI TỪ MASTER]:`, job);

        // Agent bận ở đây
        const result = await handleJob(job);

        // Chỉ sau khi hoàn thành Job mới report
        await reportJobResultToMaster(result);

        console.log(
          `[✅ JOB ${job.job_id}] Hoàn thành. Agent sẵn sàng nhận Job tiếp theo.`,
        );
      }
    } catch (err) {
      console.error(`[⚠️ LỖI AGENT]: ${err.message}`);
    }

    // Chờ trước khi poll lần tiếp theo
    await new Promise((resolve) => setTimeout(resolve, config.POLL_INTERVAL));
  }
}

runAgent();
