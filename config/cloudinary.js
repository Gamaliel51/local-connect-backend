const cloudinary = require('cloudinary').v2;
const multer = require('multer')
const settings = require('./settings');

cloudinary.config({
  cloud_name: settings.cloud_name,
  api_key: settings.cloud_api_key,
  api_secret: settings.cloud_api_secret,
  secure: true
});

module.exports = cloudinary;
