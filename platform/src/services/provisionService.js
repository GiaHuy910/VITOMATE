const path = require("path");
const config = require("../config/config");
const sshService = require("../provisioning/sshService");
const Worker = require("../models/Workers");
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
    DEPLOYER: "agentDeploy",
  };

  const agentFolder = agentFolder_map[role.toUpperCase()];
  const resourcesDir = path.join(baseAgentDir, agentFolder);

  // 3. Xử lý Worker ID chuẩn xác
  let workerId;
  let rawAgentToken;
  let hashedToken;
  const existingWorker = await Worker.findOne({ host })
    .select("workerId")
    .lean();

  if (existingWorker && existingWorker.workerId) {
    // Nếu tìm thấy -> Lấy trường workerId ra
    workerId = existingWorker.workerId;
    hashedToken = existingWorker.agentTokenHash;
  } else {
    // Nếu chưa có -> Tăng counter và gán trực tiếp cho workerId
    const counter = await workerCounter.findOneAndUpdate(
      { _id: "workerId" },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true },
    );
    workerId = counter.sequence;
    rawAgentToken = tokenService.generateToken();
    hashedToken = hashToken(rawAgentToken);
  }

  // 5. Lưu (hoặc cập nhật) thông tin Worker vào MongoDB (Lưu HASH TOKEN, không lưu rawToken)
  await Worker.findOneAndUpdate(
    { workerId },
    {
      workerId,
      host,
      port: Number(port) || 22,
      role,
      agentTokenHash: hashedToken,
      status: "BOOTSTRAPPING",
    },
    { upsert: true, new: true },
  );

  const targetworker = {
    workerId: workerId,
    host,
    port: Number(port) || Number(process.env.PORT_WORKER) || 22,
    username,
    password,
    role: role,
    masterUrl,
    registryUrl,
    agentToken: rawAgentToken,
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
