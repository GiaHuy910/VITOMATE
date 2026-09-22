const crypto = require("crypto");
const Worker = require("../models/Workers");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Thiếu Authorization header",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization phải sử dụng Bearer Token",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const receivedTokenHash = hashToken(token);

    /*
     * ==================================================
     * 1. KIỂM TRA SERVER TOKEN
     * ==================================================
     */

    const serverToken = process.env.SERVER_TOKEN;

    if (serverToken) {
      const serverTokenHash = hashToken(serverToken);

      if (
        crypto.timingSafeEqual(
          Buffer.from(receivedTokenHash),
          Buffer.from(serverTokenHash),
        )
      ) {
        req.auth = {
          type: "server",
        };

        return next();
      }
    }

    /*
     * ==================================================
     * 2. KIỂM TRA WORKER TOKEN
     * ==================================================
     */

    const worker = await Worker.findOne({
      agentTokenHash: receivedTokenHash,
    });

    if (worker) {
      req.auth = {
        type: "worker",
        workerId: worker.workerId,
        role: worker.role,
      };

      return next();
    }

    /*
     * ==================================================
     * 3. KHÔNG XÁC THỰC ĐƯỢC
     * ==================================================
     */

    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  } catch (error) {
    console.error("[Auth] Lỗi xác thực:", error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực",
    });
  }
};

module.exports = authenticate;
