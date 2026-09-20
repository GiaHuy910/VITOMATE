const DeploymentCounter = require("../app/models/DeploymentCounter");

const getNextDeploymentId = async () => {
  const deploymentCounter = await DeploymentCounter.findOneAndUpdate(
    { _id: "user_id" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return deploymentCounter.sequence;
};

module.exports = { getNextDeploymentId };
