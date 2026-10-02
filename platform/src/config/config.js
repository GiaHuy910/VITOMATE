const config = {
  master: {
    ip: process.env.MASTER_IP,
    port: Number(process.env.MASTER_PORT),
    url: process.env.MASTER_URL,
  },

  server: {
    server_url_dev: process.env.SERVER_URL_DEV,
    server_url_prod: process.env.SERVER_URL_PROD,
  },

  worker: {
    primaryKeyPath: process.env.WORKER_PRIMARY_KEY_PATH,
  },

  platform: {
    apikey: process.env.PLATFORM_API_KEY,
  },

  registry: {
    url: process.env.REGISTRY_URL,
  },
};

module.exports = config;
