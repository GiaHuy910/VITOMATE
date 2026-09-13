const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeploymentSchema = new Schema(
  {
    repo_id: { type: Number, required: false },
    app_id: { type: Number, required: false, sparse: true, unique: true },
    deployments: [
      {
        deploy_times: { type: String },
        deploy_at: { type: Date },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Deployment", DeploymentSchema);
