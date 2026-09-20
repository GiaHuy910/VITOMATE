const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    worker_id: { type: String, required: true, unique: true, index: true },
    host: { type: String, required: true },

    // Cấu hình phần cứng
    cpu_cores: { type: Number, required: false },
    total_ram_mb: { type: Number, required: false },
    free_disk_gb: { type: Number, required: false },

    // Phân loại vai trò
    role: {
      type: String,
      enum: ["BUILDER", "DEPLOYER"],
      required: true,
      index: true, // Đánh index để query tìm worker nhanh hơn
    },
    // Token hash để xác thực agent
    agent_token_hash: {
      type: String,
      required: true,
      unique: true,
    },

    // Trạng thái vận hành
    status: {
      type: String,
      enum: ["BOOTSTRAPPING", "READY", "BUSY", "OFFLINE"],
      default: "READY",
      index: true,
    },

    active_jobs_count: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// 1. Static Method: Tìm Worker rảnh nhất theo Role
workerSchema.statics.findBestAvailable = function (role) {
  return this.findOne({ role, status: "READY" }).sort({
    active_jobs_count: 1,
    total_ram_mb: -1,
  });
};

// 2. Instance Method: Đánh dấu Worker chuyển sang trạng thái bận
workerSchema.methods.markAsBusy = function () {
  this.status = "BUSY";
  this.active_jobs_count += 1;
  return this.save();
};

module.exports = mongoose.model("Worker", workerSchema);
