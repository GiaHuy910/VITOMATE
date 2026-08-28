const http = require("http");
const config = require("./config");

function pollMaster() {
  return new Promise((resolve, reject) => {
    const url = `${config.MASTER_URL}/api/worker/poll?worker_id=${config.WORKER_ID}`;

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

module.exports = { pollMaster };
