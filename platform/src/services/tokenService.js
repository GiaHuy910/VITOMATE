const crypto = require("crypto");

/**
 * Tạo Agent Token ngẫu nhiên.
 *
 * Token này là token thật và chỉ dùng để:
 * - gửi sang Worker trong quá trình bootstrap
 * - Worker lưu vào /etc/paas-agent/agent.env
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash Agent Token trước khi lưu vào database.
 *
 * Database chỉ lưu tokenHash,
 * không lưu token thật.
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateToken,
  hashToken,
};
