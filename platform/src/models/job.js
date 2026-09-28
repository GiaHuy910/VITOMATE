const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    job_id: { type: Number, required: true, unique: true, index: true },
    app_id: { type: Number, require: true },
    deployment_order: { type: Number, require: true },
    owner: { type: String, required: true },
    app_name: { type: String, required: true },
    branch: { type: String, default: "main" },

    // Thông tin Image khi Build thành công
    image_tag: { type: String, default: "" },

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
    assigned_worker_id: { type: String, default: null },
    assigned_at: { type: Date, default: null },

    // Log hệ thống
    logs: { type: String, default: "" },

    // Thông tin Cấu hình Container khi Deploy
    container_port: { type: Number, default: null },
    env_vars: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", JobSchema);
