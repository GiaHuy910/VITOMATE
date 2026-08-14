const Counter = require("../app/models/Counter");

const getNextUserId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "userId" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return counter.sequence;
};

module.exports = { getNextUserId };
