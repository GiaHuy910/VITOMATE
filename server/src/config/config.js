const config = {
  app: {
    port: parseInt(process.env.PORT, 10),
    clientUrlDev: process.env.CLIENT_URL_DEV || "http://localhost:3000",
    clientUrlProd: process.env.CLIENT_URL_PROD,
  },
  secrets: {
    jwt: process.env.JWT_SECRET,
    cbc: process.env.CBC_SECRET,
  },
  database: {
    serverUri: process.env.DB_URI_SERVER,
    platformUri: process.env.DB_URI_PLATFORM,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUrl: process.env.GITHUB_CALLBACK_URL,
    apiUrl: process.env.GITHUB_URL_API || "https://api.github.com",
    url: process.env.GITHUB_URL || "https://github.com",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

const requiredEnv = ["JWT_SECRET", "DB_URI_SERVER", "DB_URI_PLATFORM"];
requiredEnv.forEach((envName) => {
  if (!process.env[envName]) {
    console.warn(`Cảnh báo: Thiếu biến môi trường quan trọng: ${envName}`);
  }
});
module.exports = config;
