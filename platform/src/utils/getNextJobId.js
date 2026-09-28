const JobCounter = require("../models/JobCounter");

const getNextJobId = async () => {
  const jobCounter = await JobCounter.findOneAndUpdate(
    { _id: "user_id" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return jobCounter.sequence;
};

module.exports = { getNextJobId };
