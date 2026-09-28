const config = require("./config/config");
const api = require("./services/api");
const executor = require("./executor");

console.log(`[🚀 AGENT BUILD] Khởi chạy Build Agent [${config.AGENT_ID}]...`);
console.log(`[🔗 AGENT BUILD] Kết nối tới Master: ${config.MASTER_URL}`);

async function runAgent() {
  while (true) {
    try {
      const job = await api.pollMaster();

      if (job) {
        console.log(`[📥 LỆNH MỚI TỪ MASTER]:`, job);

        // Agent bận ở đây
        const result = await executor.handleJob(job);

        // Chỉ sau khi hoàn thành Job mới report
        const report = await api.reportJobResultToMaster(result);

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
