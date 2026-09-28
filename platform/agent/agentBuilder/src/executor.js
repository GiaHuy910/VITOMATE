const path = require("path");
const fs = require("fs");

const config = require("./config/config");
const gitHandler = require("./handlers/git");
const builderHandler = require("./handlers/builder");
const systemHandler = require("./handlers/system");

const handleJob = async (job) => {
  const { job_id, status, owner, app_name, branch, image_tag } = job;

  switch (status) {
    case "BUILDING":
      console.log(`[JOB ${job_id}] Bắt đầu BUILDING...`);
      const buildDir = path.join(config.APPS_DIR, String(job_id));
      const cloneResult = await gitHandler.cloneRepository({
        owner,
        app_name,
        branch,
        buildDir,
      });

      if (!cloneResult.success) {
        return {
          success: false,
          message: "Failed to clone repository",
          logs: cloneResult.logs,
        };
      }

      const res = await builderHandler.buildAndPushImage({
        job_id,
        buildDir,
        image_tag,
      });

      return res;
    case "GET_INFO":
      console.log(`[JOB ${job_id}] Bắt đầu GET_INFO...`);
      const info = await systemHandler.getSystemStats();
      return info;
  }
};

module.exports = { handleJob };
