const os = require("os");

async function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: os.uptime(),
    cpuLoad: os.loadavg(),
    memory: {
      totalMB: Math.round(totalMem / 1024 / 1024),
      freeMB: Math.round(freeMem / 1024 / 1024),
      usagePercent: Math.round((usedMem / totalMem) * 100),
    },
  };
}

module.exports = { getSystemStats };
