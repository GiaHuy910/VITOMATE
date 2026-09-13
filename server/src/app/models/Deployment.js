const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeploymentSchema = new Schema(
  {
    deployment_id: { type: Number, unique: true },
    repo_id: { type: Number, required: true },
    app_id: { type: Number, required: false, sparse: true, unique: true },
    deployments: [
      {
        deploy_times: { type: Number },
        deploy_at: { type: Date },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Deployment", DeploymentSchema);
