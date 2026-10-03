const config = require("../config/config");

/**
 * Poll tìm Job Deploy mới từ Master
 */
async function pollMaster() {
  const url = `http://${config.MASTER_URL}/api/deployers/poll?worker_id=${config.WORKER_ID}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${config.AGENT_TOKEN}`,
      },
    });

    // 204 = Không có việc
    if (res.status === 204) {
      console.log("Khong co viec.");
      return null;
    }

    if (res.status === 200) {
      console.log("Co job");
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
async function reportJobResultToMaster(result) {
  const url = `http://${config.MASTER_URL}/api/deployers/callback`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${config.AGENT_TOKEN}`,
      },
      body: JSON.stringify(result),
    });

    const responseData = await response.text();

    if (response.ok) {
      console.log(
        `[📤 REPORT] Đã gửi báo cáo Deploy Job [${result.job_id}] về Master thành công.`,
      );

      return responseData;
    }

    console.error(
      `[❌ REPORT FAILED] Master trả về mã lỗi HTTP: ${response.status}`,
    );

    console.error(`[❌ REPORT FAILED] Response: ${responseData}`);

    console.error(
      `[❌ REPORT FAILED] Payload: ${JSON.stringify(result, null, 2)}`,
    );

    throw new Error(`Master HTTP Error: ${response.status}`);
    return;
  } catch (err) {
    console.error(
      `[❌ REPORT FAILED] Không thể gửi báo cáo Deploy về Master:`,
      err.message,
    );
    return;

    throw err;
  }
}

module.exports = {
  pollMaster,
  reportJobResultToMaster,
};
