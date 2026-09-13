const { v2: cloudinary } = require("cloudinary");
const config=require('./config')
const cloudinaryCloudName=config.cloudinary.cloudName;
const cloudinaryApiKey=config.cloudinary.apiKey;
const cloudinaryApiSecret=config.cloudinary.apiSecret;

cloudinary.config({
  cloud_name:cloudinaryCloudName,
  api_key:cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

module.exports = cloudinary;
