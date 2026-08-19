const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RepoSchema = new Schema(
  {
    userId: { type: Number, unique: true, required: true },
    projectName: { type: String, required: true },
    projectId: { type: Number, unique: true, required: true },
    githubOwner: { type: String, unique: true, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Repo", RepoSchema);
