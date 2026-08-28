const jwt = require("jsonwebtoken");

const createJwt = (userId) => {
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

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  createJwt,
  verifyJwt,
};
