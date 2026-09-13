const crypto = require("crypto");

const config = require("../config/config");
const cbcSecret = config.secrets.cbc;

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = Buffer.from(cbcSecret, "hex");
const iv_length = 16;

const createCbc = (AccessToken) => {
  if (!AccessToken) return null;
  const iv = crypto.randomBytes(iv_length);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(AccessToken, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};
module.exports = { createCbc };
