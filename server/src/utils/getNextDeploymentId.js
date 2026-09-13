const DeploymentCounter = require("../app/models/DeploymentCounter");

const getNextDeploymentId = async () => {
  const deploymentCounter = await DeploymentCounter.findOneAndUpdate(
    { _id: "userId" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return deploymentCounter.sequence;
};

module.exports = { getNextDeploymentId };
