const path = require("path");
const crypto = require("crypto");
const config = require("../config/config");
const sshService = require("../provisioning/sshService");
const Workers = require("../models/workers");
const workerCounter = require("../models/WorkerCounter");
const tokenService = require("./tokenService");

// Hàm hash SHA-256
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const bootstrapWorker = async (workerData) => {
  const { host, port, username, password, role } = workerData;

  const masterUrl = `${config.master.ip}:${config.master.port}`;

  const registryUrl = config.registry.url;

  // 1. Sửa đường dẫn trỏ đúng ra thư mục agent ở gốc dự án (đi ra 3 cấp từ src/services)
  const baseAgentDir = path.join(__dirname, "../../../agent");

  // 2. Xác định thư mục agent tương ứng với role (agentBuilder hoặc agentDeploy)

  const agentFolder_map = {
    BUILDER: "agentBuilder",
    DEPLOYER: "agentDeployer",
  };

  const agentFolder = agentFolder_map[role.toUpperCase()];
  const resourcesDir = path.join(baseAgentDir, agentFolder);

  // 3. Xử lý Worker ID chuẩn xác
  let worker_id;
  let raw_agent_token;
  let hashed_token;
  const existingWorker = await Workers.findOne({ host })
    .select("worker_id")
    .lean();

  if (existingWorker && existingWorker.worker_id) {
    // Nếu tìm thấy -> Lấy trường workerId ra
    worker_id = existingWorker.worker_id;
  } else {
    // Nếu chưa có -> Tăng counter và gán trực tiếp cho worker_id
    const counter = await workerCounter.findOneAndUpdate(
      { _id: "worker_id" },
      { $inc: { sequence: 1 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    worker_id = counter.sequence;
  }
  raw_agent_token = tokenService.generateToken();
  hashed_token = hashToken(raw_agent_token);

  // 5. Lưu (hoặc cập nhật) thông tin Worker vào MongoDB (Lưu HASH TOKEN, không lưu rawToken)
  const worker = await Workers.findOneAndUpdate(
    { worker_id },
    {
      $set: {
        host,
        port: Number(port) || 22,
        role,
        agent_token_hash: hashed_token,
        status: "BOOTSTRAPPING",
      },
      $setOnInsert: {
        worker_id,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  const targetworker = {
    worker_id: worker_id,
    host,
    port: Number(port) || 22,
    username,
    password,
    role: role,
    masterUrl,
    registryUrl,
    agentToken: raw_agent_token,
    files: {
      // Trỏ đúng vào các file nằm trong agentBuilder / agentDeploy
      agent: path.join(resourcesDir, "src", "index.js"),
      service: path.join(resourcesDir, "scripts", "agent.service"),
      bootstrap: path.join(resourcesDir, "scripts", "bootstrap.sh"),
    },
  };

  // Kích hoạt SSH Bootstrap sang máy ảo từ xa
  await sshService.bootstrapWorker(targetworker);

  return targetworker;
};

module.exports = {
  bootstrapWorker,
};
