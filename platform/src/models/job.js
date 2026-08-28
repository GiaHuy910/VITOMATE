const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    repo_id: { type: String, required: true },
    owner: { type: String, required: true },
    appName: { type: String, required: true }, // Bỏ unique: true ở đây
    branch: { type: String, default: "main" },

    // Thông tin Image khi Build thành công
    imageTag: { type: String, default: "" },

    // Trạng thái vòng đời của Job
    status: {
      type: String,
      enum: [
        "PENDING", // Chờ Builder lấy
        "BUILDING", // Đang Build
        "BUILT", // Build xong, chờ gán Deploy
        "DEPLOY_PENDING", // Đã gán Deploy Worker, chờ Worker đến lấy
        "DEPLOYING", // Deploy Worker đang chạy container
        "COMPLETED", // Hoàn tất thành công
        "FAILED", // Thất bại
      ],
      default: "PENDING",
      index: true,
    },

    // Phân công Deploy Worker (Phục vụ luồng Pulling/Polling)
    assignedWorkerId: { type: String, default: null, index: true },
    assignedAt: { type: Date, default: null },

    // Log hệ thống
    logs: { type: String, default: "" },

    // Thông tin Cấu hình Container khi Deploy
    containerPort: { type: Number, default: 3000 },
    hostPort: { type: Number, default: 8080 },
    envVars: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
