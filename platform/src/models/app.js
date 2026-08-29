const mongoose = require("mongoose");

const appSchema = new mongoose.Schema(
  {
    repoId: { type: String, required: true },
    owner: { type: String, required: true },
    appName: { type: String, required: true },
    branch: { type: String, default: "main" },

    // Thông tin Runtime của Container đang chạy
    containerId: { type: String, default: null },
    imageTag: { type: String, default: null },
    hostPort: { type: Number, default: null },
    containerPort: { type: Number, default: 3000 },
    publicUrl: { type: String, default: null },

    // Worker hiện tại đang chạy Container
    workerId: { type: String, default: null },

    // Biến môi trường hiện tại của App
    envVars: { type: Map, of: String, default: {} },

    // Trạng thái App: RUNNING, STOPPED, DEPLOYING, FAILED
    status: {
      type: String,
      enum: ["PENDING", "DEPLOYING", "RUNNING", "STOPPED", "FAILED"],
      default: "PENDING",
    },

    // Job Deploy mới nhất đang thực thi
    lastJobId: { type: String, default: null },
  },
  { timestamps: true },
);

// Tạo Index kết hợp để query nhanh ứng dụng theo Repo và Owner
appSchema.index({ repoId: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model("App", appSchema);
