const mongoose = require("mongoose");
// const MongooseDelete = require("mongoose-delete");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);
// userSchema.index({ username: 1, email: 1 });
module.exports = mongoose.model("User", UserSchema);
