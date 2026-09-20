const mongoose = require("mongoose");

const appSchema = new mongoose.Schema(
  {
    app_id: { type: String, required: true, unique: true },
    app_name: { type: String, required: true },
    branch: { type: String, default: "main" },

    // Thông tin Runtime của Container đang chạy
    container_id: { type: String, default: null },
    image_tag: { type: String, default: null },
    host_port: { type: Number, default: null },
    container_port: { type: Number, default: 3000 },
    public_url: { type: String, default: null },

    // Worker hiện tại đang chạy Container
    worker_id: { type: String, default: null },

    // Biến môi trường hiện tại của App
    env_vars: { type: Map, of: String, default: {} },

    // Trạng thái App: RUNNING, STOPPED, DEPLOYING, FAILED
    status: {
      type: String,
      enum: ["PENDING", "DEPLOYING", "RUNNING", "STOPPED", "FAILED"],
      default: "PENDING",
    },

    // Job Deploy mới nhất đang thực thi
    lastJob_id: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("App", appSchema);
