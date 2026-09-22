const config = require("../config/config");

/**
 * Poll tìm Job Deploy mới từ Master
 */
async function pollMaster() {
  const url = `${config.MASTER_URL}/api/deployers/poll?worker_id=${config.WORKER_ID}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${process.env.AGENT_TOKEN}`,
      },
    });

    // 204 = Không có việc
    if (res.status === 204) {
      return null;
    }

    if (res.status === 200) {
      const data = await res.json();
      return data;
    }

    throw new Error(`Master trả về mã lỗi HTTP: ${res.status}`);
  } catch (err) {
    console.error("[⚠️ API] Lỗi khi poll job:", err.message);
    return null;
  }
}

/**
 * Gửi báo cáo kết quả Deploy (Thành công / Thất bại) về Master
 */
async function reportJobResultToMaster(jobId, result) {
  const url = `${config.MASTER_URL}/api/deployers/callback`;

  const payload = {
    jobId: safeJobId,
    workerId: config.WORKER_ID,
    ...result,
  };

  const masterUrl = config.MASTER_URL;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${process.env.AGENT_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.text();

    if (response.ok) {
      console.log(
        `[📤 REPORT] Đã gửi báo cáo Deploy Job [${safeJobId}] về Master thành công.`,
      );

      return responseData;
    }

    console.error(
      `[❌ REPORT FAILED] Master trả về mã lỗi HTTP: ${response.status}`,
    );

    throw new Error(`Master HTTP Error: ${response.status}`);
  } catch (err) {
    console.error(
      `[❌ REPORT FAILED] Không thể gửi báo cáo Deploy về Master:`,
      err.message,
    );

    throw err;
  }
}

module.exports = {
  pollMaster,
  reportJobResultToMaster,
};
