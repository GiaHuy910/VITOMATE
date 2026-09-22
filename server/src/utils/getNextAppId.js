const AppCounter = require("../app/models/AppCounter");

const getNextAppId = async () => {
  const appCounter = await AppCounter.findOneAndUpdate(
    { _id: "repo_id" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return appCounter.sequence;
};

module.exports = { getNextAppId };
