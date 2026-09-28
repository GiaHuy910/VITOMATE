const deployHandler = require("./handlers/deploy");
const systemHandler = require("./handlers/system");
const pullImage = require("./handlers/pullImage");
const config = require("./config/config");
const os = require("os");

async function handleJob(job) {
  const {
    job_id,
    app_id,
    deployment_order,
    image_tag,
    registryAuth,
    env_vars,
  } = job;

  console.log("job: ", job);

  if (!image_tag) {
    console.log("thieu image_tag.");
    return;
  }

  await pullImage.pullImage(image_tag, registryAuth);

  container_port = config.CONTAINER_PORT;

  const res = await deployHandler.deployApp({
    job_id,
    app_id,
    container_port,
    deployment_order,
    image_tag,
    env_vars,
  });
  console.log("res: ", res);

  return res;
}
module.exports = { handleJob };
