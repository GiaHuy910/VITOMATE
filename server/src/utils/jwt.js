const jwt = require("jsonwebtoken");

const createToken = (userId) => {
  return jwt.sign(
    {
      sub: userId,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    },
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  createToken,
  verifyToken,
};
