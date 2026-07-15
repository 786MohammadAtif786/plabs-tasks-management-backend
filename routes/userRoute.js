const express = require("express");
const router = express.Router();
const { updateProfile, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware"); // apna existing auth middleware
const upload = require("../middleware/upload");

router.use(protect);

// "image" wahi field name hona chahiye jo frontend FormData me use ho raha hai
router.put("/profile", upload.single("image"), updateProfile);
router.delete("/account", deleteAccount);

module.exports = router;