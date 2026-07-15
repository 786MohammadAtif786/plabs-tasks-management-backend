const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devnotes/avatars", // Cloudinary me is folder ke andar images jayengi
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }], // profile pic ke liye square crop
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;