const Worker = require("../models/Worker");

/**
 * Lấy tất cả Worker, sắp xếp mới nhất lên đầu
 */
const getAllWorkers = async () => {
  return await Worker.find().sort({ createdAt: -1 });
};

/**
 * Tìm Worker theo worker_id
 */
const getWorkerById = async (id) => {
  return await Worker.findOne({ worker_id: id });
};

/**
 * 2. Đăng ký / Cập nhật Worker
 */
const upsertWorker = async (workerData) => {
  const {
    worker_id,
    host,
    cpu_cores,
    total_ram_mb,
    free_disk_gb,
    role,
    status,
  } = workerData;

  if (!worker_id) {
    throw new Error("worker_id là bắt buộc");
  }

  const setPayload = {
    host,
    cpu_cores,
    total_ram_mb,
    free_disk_gb,
    role,
    last_seen: new Date(),
  };

  // Chỉ đưa status vào $set nếu thực sự có truyền status
  if (status) {
    setPayload.status = status;
  }

  return await Worker.findOneAndUpdate(
    { worker_id },
    {
      $set: setPayload,

      $setOnInsert: {
        active_jobs_count: 0,

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
 * 4. Tìm Worker phù hợp nhất để giao Job
 */
const findAvailableWorker = async (role) => {
  return await Worker.findOne({
    role,
    status: "READY",
  }).sort({
    active_jobs_count: 1,
    total_ram_mb: -1,
  });
};

/**
 * 5. Cập nhật số lượng Job đang chạy của Worker
 */
const updateActiveJobs = async (worker_id, increment = 1) => {
  return await Worker.findOneAndUpdate(
    { worker_id },
    {
      $inc: {
        active_jobs_count: increment,
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
const updateHeartbeat = async (worker_id) => {
  return await Worker.findOneAndUpdate(
    { worker_id },
    {
      $set: {
        last_seen: new Date(),
      },
    },
    {
      returnDocument: "after",
    },
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
