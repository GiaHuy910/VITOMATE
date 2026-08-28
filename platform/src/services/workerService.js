const Worker = require("../models/Workers");

/**
 * Lấy tất cả Workers, sắp xếp mới nhất lên đầu
 */
const getAllWorkers = async () => {
  return await Worker.find().sort({ createdAt: -1 });
};

/**
 * Tìm Worker theo workerId hoặc _id
 */
const getWorkerById = async (id) => {
  return (
    (await Worker.findOne({ workerId: id })) ||
    (await Worker.findById(id).catch(() => null))
  );
};

// 1. Đăng ký / Cập nhật Worker
const upsertWorker = async (workerData) => {
  const { workerId, ip, cpuCores, totalRamMb, freeDiskGb, role, status } =
    workerData;

  // 1. Chỉ đưa status vào $set nếu thực sự có truyền status
  const setPayload = {
    ip,
    cpuCores,
    totalRamMb,
    freeDiskGb,
    role,
    lastSeen: new Date(),
  };

  if (status) {
    setPayload.status = status;
  }

  // 2. Xóa trường 'status' ra khỏi $setOnInsert để tránh trùng lặp
  return await Worker.findOneAndUpdate(
    { workerId },
    {
      $set: setPayload,
      $setOnInsert: {
        activeJobsCount: 0,
        // Nếu không có status truyền lên thì mặc định mới đặt là READY
        ...(status ? {} : { status: "READY" }),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    },
  );
};

// 2. Tìm Worker phù hợp nhất để giao Job
const findAvailableWorker = async (role) => {
  return await Worker.findOne({
    role,
    status: "READY",
  }).sort({
    activeJobsCount: 1,
    totalRamMb: -1,
  });
};

// 3. Cập nhật số lượng Job đang chạy của Worker
const updateActiveJobs = async (workerId, increment = 1) => {
  return await Worker.findOneAndUpdate(
    { workerId },
    { $inc: { activeJobsCount: increment } },
    { returnDocument: "after" }, // Sửa từ new: true
  );
};

// 4. Cập nhật Heartbeat khi Worker gửi ping định kỳ
const updateHeartbeat = async (workerId) => {
  return await Worker.findOneAndUpdate(
    { workerId },
    { $set: { lastSeen: new Date() } },
    { returnDocument: "after" }, // Sửa từ new: true
  );
};

module.exports = {
  upsertWorker,
  findAvailableWorker,
  updateActiveJobs,
  updateHeartbeat,
  getAllWorkers,
  getWorkerById,
};
