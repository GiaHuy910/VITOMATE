const deployHandler = require("./handlers/deploy");
const systemHandler = require("./handlers/system");

async function handleJob(job) {
  console.log(
    `[⚙️ DEPLOY EXECUTOR] Nhận Job [${job.id}] - Action: ${job.type}`,
  );

  try {
    switch (job.type) {
      case "DEPLOY_APP": {
        const { imageTag, appPort, containerPort, envVars } = job.payload;
        const containerName = `app-${job.payload.appId || job.id}`;

        const deployResult = await deployHandler.deployApp({
          imageTag,
          appPort,
          containerPort,
          containerName,
          envVars,
        });

        return {
          success: true,
          jobId: job.id,
          containerId: deployResult.containerId,
          port: deployResult.port,
        };
      }

      case "GET_SYSTEM_STATS": {
        const stats = await systemHandler.getSystemStats();
        return { success: true, jobId: job.id, stats };
      }

      default:
        throw new Error(
          `Loại Job '${job.type}' không được hỗ trợ bởi Deploy Agent.`,
        );
    }
  } catch (err) {
    console.error(`[❌ DEPLOY FAILED] [${job.id}]:`, err.message || err);
    return {
      success: false,
      jobId: job.id,
      error: err.message || err,
    };
  }
}

module.exports = { handleJob };
