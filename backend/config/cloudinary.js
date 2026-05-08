// ============================================
// CLOUDINARY CONFIG — Image upload setup
// ============================================
// Cloudinary = a service that stores your images online
// Multer = a package that handles file uploads in Express
// multer-storage-cloudinary = connects Multer to Cloudinary

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CloudinaryStorage tells Multer WHERE to put uploaded files
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-app", // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 1200, height: 630, crop: "limit" }, // max size for blog cover images
      { quality: "auto" }, // auto-optimize quality
      { fetch_format: "auto" }, // serve best format (webp if supported)
    ],
  },
});

// multer() creates the upload middleware
// limits.fileSize = max file size (5MB here)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB in bytes
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // accept file
    } else {
      cb(new Error("Only image files are allowed!"), false); // reject file
    }
  },
});

module.exports = { upload, cloudinary };
