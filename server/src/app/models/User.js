const mongoose = require("mongoose");
// const MongooseDelete = require("mongoose-delete");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: { type: Number, unique: true, required: true },
    displayname: { type: String, required: false },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

// userSchema.index({ username: 1, email: 1 });
module.exports = mongoose.model("User", UserSchema);
