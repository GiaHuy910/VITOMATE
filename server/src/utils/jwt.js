const jwt = require("jsonwebtoken");
const config = require("../config/config");
const jwtSecret = config.secrets.jwt;
const createJwt = (user_id) => {
  return jwt.sign(
    {
      sub: user_id,
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
