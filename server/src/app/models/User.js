const mongoose = require("mongoose");
// const MongooseDelete = require("mongoose-delete");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    user_id: { type: Number, unique: true, required: true },
    display_name: { type: String, required: false },
    username: { type: String, unique: false, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    github_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      public_id: {
        type: String,
        default: null,
      },
    },
    encrypted_token: { type: String, required: false },
    theme: {
      type: String,
      enum: ["Light", "Dark", "System"],
      default: "Light",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
