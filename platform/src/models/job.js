const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    job_id: { type: String, required: true, unique: true, index: true },
    repo_id: { type: String, required: true },
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
    assigned_worker_id: { type: String, default: null, index: true },
    assigned_at: { type: Date, default: null },

    // Log hệ thống
    logs: { type: String, default: "" },

    // Thông tin Cấu hình Container khi Deploy
    container_port: { type: Number, default: 3000 },
    host_port: { type: Number, default: 8080 },
    env_vars: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
