const Worker = require("../models/Workers");
const PendingWorker = require("../models/PendingWorker");
const tokenService = require("./tokenService");

/**
 * Lấy tất cả Workers, sắp xếp mới nhất lên đầu
 */
const getAllWorkers = async () => {
  return await Worker.find().sort({ createdAt: -1 });
};

/**
 * Tìm Worker theo workerId
 */
const getWorkerById = async (id) => {
  return await Worker.findOne({ workerId: id });
};

/**
 * 2. Đăng ký / Cập nhật Worker
 *
 * Hàm này được gọi SAU KHI Worker đã xác thực
 * bằng Agent Token.
 *
 * workerId và role không nên lấy từ request body.
 * Chúng sẽ được lấy từ req.workerIdentity.
 */
const upsertWorker = async (workerData) => {
  const { workerId, host, cpuCores, totalRamMb, freeDiskGb, role, status } =
    workerData;

  if (!workerId) {
    throw new Error("workerId là bắt buộc");
  }

  const setPayload = {
    host,
    cpuCores,
    totalRamMb,
    freeDiskGb,
    role,
    lastSeen: new Date(),
  };

  // Chỉ đưa status vào $set nếu thực sự có truyền status
  if (status) {
    setPayload.status = status;
  }

  return await Worker.findOneAndUpdate(
    { workerId },
    {
      $set: setPayload,

      $setOnInsert: {
        activeJobsCount: 0,

        // Nếu không có status truyền lên
        // thì Worker mới mặc định là READY
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

/**
 * 3. Xóa PendingWorker sau khi Worker đăng ký thành công
 */
const deletePendingWorker = async (workerId) => {
  return await PendingWorker.deleteOne({
    workerId,
  });
};

/**
 * 4. Tìm Worker phù hợp nhất để giao Job
 */
const findAvailableWorker = async (role) => {
  return await Worker.findOne({
    role,
    status: "READY",
  }).sort({
    activeJobsCount: 1,
    totalRamMb: -1,
  });
};

/**
 * 5. Cập nhật số lượng Job đang chạy của Worker
 */
const updateActiveJobs = async (workerId, increment = 1) => {
  return await Worker.findOneAndUpdate(
    { workerId },
    {
      $inc: {
        activeJobsCount: increment,
      },
    },
    {
      returnDocument: "after",
    },
  );
};

/**
 * 6. Cập nhật Heartbeat khi Worker gửi ping định kỳ
 */
const updateHeartbeat = async (workerId) => {
  return await Worker.findOneAndUpdate(
    { workerId },
    {
      $set: {
        lastSeen: new Date(),
      },
    },
    {
      returnDocument: "after",
    },
  );
};

module.exports = {
  upsertWorker,
  deletePendingWorker,
  findAvailableWorker,
  updateActiveJobs,
  updateHeartbeat,
  getAllWorkers,
  getWorkerById,
};
