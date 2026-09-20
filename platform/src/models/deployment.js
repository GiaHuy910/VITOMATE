const mongoose = require("mongoose");

const deploymentSchema = new mongoose.Schema(
  {
    deployment_id: { type: Number, required: true, unique: true },
    app_id: { type: String, required: true },
    log: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Deployment", deploymentSchema);
