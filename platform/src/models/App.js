const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppSchema = new Schema(
  {
    app_id: { type: String, required: true, unique: true },

    worker_id: { type: String, default: null },

    container_port: { type: Number, default: 3000 },

    public_url: { type: String, default: null },

    deployments: [
      {
        is_rollback: { type: Boolean, default: false },

        deployment_order: { type: Number, required: true },

        deploy_at: { type: Date, default: Date.now },

        branch: { type: String, default: "main" },

        commit_hash: { type: String, default: null },

        image_tag: { type: String, default: null },

        job_id: { type: String, default: null },

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
          ],
          default: "PENDING",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("App", AppSchema);
