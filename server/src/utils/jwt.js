const jwt = require("jsonwebtoken");
const config = require("../config/config");
const jwtSecret = config.secrets.jwt;
const createJwt = (userId) => {
  return jwt.sign(
    {
      sub: userId,
    },
    jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    },
  );
};

const verifyJwt = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  createJwt,
  verifyJwt,
};
