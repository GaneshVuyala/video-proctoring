const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'interview-recordings', // Folder name in Cloudinary
    resource_type: 'video', // Tell Cloudinary we're uploading videos
    public_id: (req, file) => `recording-${req.params.interviewId}`, // Custom filename
  },
});

module.exports = { cloudinary, storage };