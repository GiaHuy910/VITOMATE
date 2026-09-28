const WorkerCounter = require("../models/WorkerCounter");

const getNextJobId = async () => {
  const workerCounter = await WorkerCounter.findOneAndUpdate(
    { _id: "user_id" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return workerCounter.sequence;
};

module.exports = { getNextJobId };
