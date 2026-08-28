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
  // Tìm theo workerId (string ID dạng 'worker-builder-01') trước, nếu không có thì tìm theo _id của Mongo
  return (
    (await Worker.findOne({ workerId: id })) ||
    (await Worker.findById(id).catch(() => null))
  );
};

// 1. Đăng ký / Cập nhật Worker (Hàm của bạn)
const upsertWorker = async (workerData) => {
  const { workerId, ip, cpuCores, totalRamMb, freeDiskGb, role, status } =
    workerData;

  const updateData = {
    ip,
    cpuCores,
    totalRamMb,
    freeDiskGb,
    role,
    lastSeen: new Date(),
  };

  if (status) {
    updateData.status = status;
  }

  return await Worker.findOneAndUpdate(
    { workerId },
    {
      $set: updateData,
      $setOnInsert: { status: status || "READY", activeJobsCount: 0 },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );
};

// 2. Tìm Worker phù hợp nhất để giao Job (Ưu tiên rảnh việc + RAM lớn)
const findAvailableWorker = async (role) => {
  return await Worker.findOne({
    role,
    status: "READY",
  }).sort({
    activeJobsCount: 1, // Máy ít Job hơn đứng trước
    totalRamMb: -1, // Máy nhiều RAM hơn đứng trước
  });
};

// 3. Cập nhật số lượng Job đang chạy của Worker
const updateActiveJobs = async (workerId, increment = 1) => {
  return await Worker.findOneAndUpdate(
    { workerId },
    { $inc: { activeJobsCount: increment } },
    { new: true },
  );
};

// 4. Cập nhật Heartbeat khi Worker gửi ping định kỳ
const updateHeartbeat = async (workerId) => {
  return await Worker.findOneAndUpdate(
    { workerId },
    { $set: { lastSeen: new Date() } },
    { new: true },
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
