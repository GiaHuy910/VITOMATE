const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppSchema = new Schema(
  {
    app_id: { type: Number, required: true, unique: true },
    repo_id: { type: Number, required: true },
    deployments: [
      {
        deployment_order: { type: Number, default: 1 },
        deploy_at: { type: Date, default: Date.now },
        env_vars: {
          type: Map,
          of: String,
          default: {},
        },
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("App", AppSchema);
