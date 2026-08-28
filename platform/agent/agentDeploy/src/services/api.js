const axios = require("axios");
const config = require("./config");

const client = axios.create({
  baseURL: config.MASTER_URL,
  timeout: 10000,
});

async function fetchNextJob() {
  try {
    const res = await client.get(
      `/api/agent/jobs/poll?agentId=${config.AGENT_ID}&type=${config.AGENT_TYPE}`,
    );
    return res.data;
  } catch (err) {
    if (err.code !== "ECONNREFUSED") {
      console.error("[⚠️ API] Lỗi khi poll job:", err.message);
    }
    return null;
  }
}

async function submitJobResult(jobId, result) {
  try {
    await client.post(`/api/agent/jobs/${jobId}/result`, {
      agentId: config.AGENT_ID,
      ...result,
    });
    console.log(`[📤 API] Đã gửi kết quả Job [${jobId}] lên Master.`);
  } catch (err) {
    console.error(`[❌ API] Lỗi gửi kết quả Job [${jobId}]:`, err.message);
  }
}

module.exports = { fetchNextJob, submitJobResult };
