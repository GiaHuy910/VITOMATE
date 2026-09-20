const mongoose = require("mongoose");

const pendingWorkerSchema = new mongoose.Schema(
  {
    // ID mà Platform cấp cho Worker
    worker_id: { type: String, required: true, unique: true, index: true },

    // Vai trò của Worker: BUILDER hoặc DEPLOYER
    role: { type: String, enum: ["BUILDER", "DEPLOYER"], required: true },

    // IP/host mà Platform dùng để SSH bootstrap
    host: { type: String, required: true },

    // Chỉ lưu HASH của Agent Token
    // Không lưu token thật
    token_hash: { type: String, required: true },

    // Pending Worker chỉ có hiệu lực trong một khoảng thời gian
    expires_at: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  },
);

// Tự động xóa PendingWorker khi expires_at đến hạn
pendingWorkerSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingWorker", pendingWorkerSchema);
