const UserCounter = require("../app/models/UserCounter");

const getNextUserId = async () => {
  const userCounter = await UserCounter.findOneAndUpdate(
    { _id: "userId" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return userCounter.sequence;
};

module.exports = { getNextUserId };
