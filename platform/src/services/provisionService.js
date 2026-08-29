const path = require("path");
const config = require("../config");
const sshService = require("../provisioning/sshService");

const bootstrapWorker = async (workerData, generatedWorkerId) => {
  const id = generatedWorkerId;
  const { host, port, username, password, role } = workerData;

  const masterUrl =
    config?.master?.url || process.env.MASTER_URL || "http://localhost:4000";

  // 1. Sửa đường dẫn trỏ đúng ra thư mục agent ở gốc dự án (đi ra 3 cấp từ src/services)
  const baseAgentDir =
    config?.resourcesPath || path.join(__dirname, "../../../agent");

  // 2. Xác định thư mục agent tương ứng với role (agentBuilder hoặc agentDeploy)
  const agentFolder =
    role?.toUpperCase() === "DEPLOYER" ? "agentDeploy" : "agentBuilder";
  const resourcesDir = path.join(baseAgentDir, agentFolder);

  const targetworker = {
    id: id || process.env.ID_WORKER || `worker-${host.replace(/\./g, "-")}`,
    host,
    port: Number(port) || Number(process.env.PORT_WORKER) || 22,
    username,
    password,
    role: role,
    masterUrl,
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
