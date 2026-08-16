const jwt = require("../utils/jwt");

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedPayload = jwt.verifyToken(token);
    req.user = {
      userId: decodedPayload.sub,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
module.exports = authenticate;
