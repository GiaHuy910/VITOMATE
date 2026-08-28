const config = {
  port: Number(process.env.PORT) || 4000,
  master: {
    url: process.env.MASTER_URL || "http://localhost:4000",
  },

  environment: process.env.NODE_ENV || "development",
};

module.exports = config;
