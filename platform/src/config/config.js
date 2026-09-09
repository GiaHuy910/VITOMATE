const config = {
  master: {
    ip: process.env.IP_MASTER,
    port: Number(process.env.PORT_MASTER) || 4000,
    url: process.env.URL_MASTER,
  },

  server_1_url_dev: process.env.server_1_url_dev,

  environment: process.env.NODE_ENV || "development",
};

module.exports = config;
