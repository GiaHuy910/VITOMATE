const RepoCounter = require("../app/models/RepoCounter");

const getNextRepoId = async () => {
  const repoCounter = await RepoCounter.findOneAndUpdate(
    { _id: "userId" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return repoCounter.sequence;
};

module.exports = { getNextRepoId };
