const UserCounter = require("../app/models/UserCounter");

const getNextUserId = async () => {
  const userCounter = await UserCounter.findOneAndUpdate(
    { _id: "user_id" },
    { $inc: { sequence: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return userCounter.sequence;
};

module.exports = { getNextUserId };
