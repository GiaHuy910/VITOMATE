const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RepoSchema = new Schema(
  {
    username: { type: String, unique: false, required: true },
    repo_id: { type: Number, unique: true, required: false },
    github_repo_id: { type: Number, unique: true, required: true },
    owner_name: { type: String, required: true },
    repo_name: { type: String, required: true },
    branch_default: { type: String, required: false },
    language: { type: String, required: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Repo", RepoSchema);
