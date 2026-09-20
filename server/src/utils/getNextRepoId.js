const RepoCounter = require("../app/models/RepoCounter");

const getNextRepoId = async () => {
  const repoCounter = await RepoCounter.findOneAndUpdate(
    { _id: "user_id" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return repoCounter.sequence;
};

module.exports = { getNextRepoId };
