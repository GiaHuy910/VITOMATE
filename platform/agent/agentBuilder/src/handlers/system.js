const os = require("os");
const { exec } = require("child_process");

/**
 * Thực thi lệnh bash trợ giúp thu thập thông số đĩa cứng (Disk)
 */
function getDiskUsage() {
  return new Promise((resolve) => {
    // Lấy dung lượng đĩa cứng của root (/) qua lệnh df
    exec(
      "df -h / | tail -1 | awk '{print $2, $3, $4, $5}'",
      (error, stdout) => {
        if (error || !stdout) {
          return resolve({
            total: "N/A",
            used: "N/A",
            free: "N/A",
            percentage: "N/A",
          });
        }
        const [total, used, free, percentage] = stdout.trim().split(/\s+/);
        resolve({ total, used, free, percentage });
      },
    );
  });
}

/**
 * Lấy toàn bộ thông số tài nguyên hệ thống hiện tại
 */
async function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

  // Tính phần trăm Load Average CPU (trên 1 phút)
  const cpus = os.cpus();
  const loadAvg = os.loadavg()[0]; // Load average 1 phút
  const cpuUsagePercent = Math.min((loadAvg / cpus.length) * 100, 100).toFixed(
    2,
  );

  const diskStats = await getDiskUsage();

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptimeSeconds: Math.floor(os.uptime()),
    cpu: {
      model: cpus[0]?.model || "Unknown",
      cores: cpus.length,
      usagePercent: `${cpuUsagePercent}%`,
    },
    memory: {
      totalMB: (totalMem / (1024 * 1024)).toFixed(0),
      usedMB: (usedMem / (1024 * 1024)).toFixed(0),
      freeMB: (freeMem / (1024 * 1024)).toFixed(0),
      usagePercent: `${memUsagePercent}%`,
    },
    disk: diskStats,
  };
}

module.exports = {
  getSystemStats,
};
