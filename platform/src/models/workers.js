const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    workerId: { type: String, required: true, unique: true, index: true },
    ip: { type: String, required: true },

    // Cấu hình phần cứng
    cpuCores: { type: Number, required: true },
    totalRamMb: { type: Number, required: true },
    freeDiskGb: { type: Number, required: true },

    // Phân loại vai trò
    role: {
      type: String,
      enum: ["BUILDER", "DEPLOY"],
      required: true,
      index: true, // Đánh index để query tìm worker nhanh hơn
    },

    // Trạng thái vận hành
    status: {
      type: String,
      enum: ["READY", "BUSY", "OFFLINE"],
      default: "READY",
      index: true,
    },

    activeJobsCount: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// 1. Static Method: Tìm Worker rảnh nhất theo Role
workerSchema.statics.findBestAvailable = function (role) {
  return this.findOne({ role, status: "READY" }).sort({
    activeJobsCount: 1,
    totalRamMb: -1,
  });
};

// 2. Instance Method: Đánh dấu Worker chuyển sang trạng thái bận
workerSchema.methods.markAsBusy = function () {
  this.status = "BUSY";
  this.activeJobsCount += 1;
  return this.save();
};

module.exports = mongoose.model("Worker", workerSchema);
