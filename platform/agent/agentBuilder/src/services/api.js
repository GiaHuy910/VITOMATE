const http = require("http");
const config = require("../config/config");

function pollMaster() {
  return new Promise((resolve, reject) => {
    const url = `${config.MASTER_URL}/api/builders/poll?worker_id=${config.WORKER_ID}`;

    http
      .get(url, (res) => {
        if (res.statusCode === 204) return resolve(null); // Không có việc

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const job = JSON.parse(data);
              resolve(job);
            } catch (err) {
              reject(new Error("Lỗi parse JSON từ Master"));
            }
          } else {
            reject(new Error(`Master trả về mã lỗi HTTP: ${res.statusCode}`));
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

async function reportJobResultToMaster(result) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(result);
    const masterUrl = new URL(
      process.env.MASTER_URL || "http://192.168.1.8:4000",
    );

    const options = {
      hostname: masterUrl.hostname,
      port: masterUrl.port || 4000,
      path: "/api/builders/callback",
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
            `[📤 REPORT] Đã gửi thông tin Image [${result.imageTag}] về Master thành công.`,
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
        `[❌ REPORT FAILED] Không thể gửi báo cáo về Master:`,
        err.message,
      );
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { pollMaster, reportJobResultToMaster };
