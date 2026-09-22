const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DeploymentSchema = new Schema(
  {
    app_id: { type: String, required: true, unique: true },

    deployments: [
      {
        // Lần deploy thứ mấy
        deploy_number: {
          type: Number,
          required: true,
        },

        // Thời gian deploy
        deploy_at: { type: Date, default: Date.now },

        branch: { type: String, default: "main" },

        commit_hash: { type: String, default: null },

        image_tag: { type: String, default: null },

        image_tag: { type: String, default: null },

        job_id: { type: String, default: null },

        worker_id: { type: String, default: null },

        container_id: { type: String, default: null },

        host_port: { type: Number, default: null },

        container_port: { type: Number, default: 3000 },

        public_url: { type: String, default: null },

        env_vars: { type: Map, of: String, default: {} },

        status: {
          type: String,
          enum: [
            "PENDING",
            "BUILDING",
            "DEPLOYING",
            "RUNNING",
            "FAILED",
            "STOPPED",
            "ROLLED_BACK",
          ],
          default: "PENDING",
        },

        // Nếu lần deploy này là rollback
        is_rollback: { type: Boolean, default: false },

        rollback_from: { type: Number, default: null },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Deployment", DeploymentSchema);
