const RepoCounter = require("../app/models/RepoCounter");

const getNextRepoId = async () => {
  const repocounter = await RepoCounter.findOneAndUpdate(
    { _id: "userId" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return repocounter.sequence;
};

module.exports = { getNextRepoId };
