const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RepoSchema = new Schema(
  {
    userId: { type: Number, unique: true, required: true },
    url: { type: string, require: false },
    repoName: { type: String, required: true },
    repoId: { type: Number, unique: true, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Repo", RepoSchema);
