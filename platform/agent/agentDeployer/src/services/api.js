const http = require("http");
const config = require("../config/config");

/**
 * Poll tìm Job Deploy mới từ Master
 */
function pollMaster() {
  return new Promise((resolve, reject) => {
    const workerId = config.WORKER_ID || config.AGENT_ID;
    const url = `${config.MASTER_URL}/api/deployers/poll?worker_id=${workerId}`; // 🟢 Sửa thành /api/deploys/poll theo chuẩn chung

    http
      .get(url, (res) => {
        if (res.statusCode === 204) return resolve(null); // Không có việc

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);

              // 🟢 BÓC TÁCH JOB MỘT CÁCH AN TOÀN
              const rawJob = response.job || response;

              // Trả về null nếu không có Job ID và Type
              if (!rawJob || (!rawJob.jobId && !rawJob.id && !rawJob.type)) {
                return resolve(null);
              }

              resolve(rawJob);
            } catch (err) {
              reject(new Error("Lỗi parse JSON từ Master"));
            }
          } else {
            reject(new Error(`Master trả về mã lỗi HTTP: ${res.statusCode}`));
          }
        });
      })
      .on("error", (err) => {
        if (err.code !== "ECONNREFUSED") {
          console.error("[⚠️ API] Lỗi khi poll job:", err.message);
        }
        resolve(null);
      });
  });
}

/**
 * Gửi báo cáo kết quả Deploy (Thành công / Thất bại) về Master
 */
function reportJobResultToMaster(jobId, result) {
  return new Promise((resolve, reject) => {
    // 🟢 Tránh lỗi undefined nếu jobId rỗng
    const safeJobId = jobId || result.jobId || result.id;

    const payload = JSON.stringify({
      jobId: safeJobId,
      workerId: config.WORKER_ID || config.AGENT_ID,
      ...result,
    });

    const masterUrl = new URL(config.MASTER_URL || "http://192.168.1.8:4000");

    const options = {
      hostname: masterUrl.hostname,
      port: masterUrl.port || 4000,
      path: "/api/deployers/callback",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk));

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(
            `[📤 REPORT] Đã gửi báo cáo Deploy Job [${safeJobId}] về Master thành công.`,
          );
          resolve(responseData);
        } else {
          console.error(
            `[❌ REPORT FAILED] Master trả về mã lỗi HTTP: ${res.statusCode}`,
          );
          reject(new Error(`Master HTTP Error: ${res.statusCode}`));
        }
      });
    });

    req.on("error", (err) => {
      console.error(
        `[❌ REPORT FAILED] Không thể gửi báo cáo Deploy về Master:`,
        err.message,
      );
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { pollMaster, reportJobResultToMaster };
