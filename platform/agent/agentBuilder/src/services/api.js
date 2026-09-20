const config = require("../config/config");

async function pollMaster() {
  const url = `${config.MASTER_URL}/api/builders/poll?worker_id=${config.WORKER_ID}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${config.AGENT_TOKEN}`,
      },
    });
    if (res.status === 204) return null;

    if (res.status === 200) {
      const job = await res.json();
      return job;
    }

    throw new Error(`Master trả về mã lỗi HTTP: ${res.status}`);
  } catch (err) {
    throw new Error(`Không thể kết nối tới Master: ${err.message}`);
  }
}

async function reportJobResultToMaster(result) {
  const url = `${process.env.MASTER_URL}/api/builders/callback`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${process.env.AGENT_TOKEN}`,
      },
      body: JSON.stringify(result),
    });

    const responseData = await res.text();

    if (res.ok) {
      console.log(
        `[📤 REPORT] Đã gửi thông tin Image [${result.imageTag}] về Master thành công.`,
      );
      return responseData;
    } else {
      console.error(
        `[❌ REPORT FAILED] Master trả về mã lỗi HTTP: ${res.status}`,
      );
      throw new Error(`Master HTTP Error: ${res.status}`);
    }
  } catch (err) {
    console.error(
      `[❌ REPORT FAILED] Không thể gửi báo cáo về Master:`,
      err.message,
    );
    throw err;
  }
}

module.exports = { pollMaster, reportJobResultToMaster };
