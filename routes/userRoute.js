const express = require("express");
const router = express.Router();
const { updateProfile, deleteAccount } = require("../controllers/Usercontroller.js");
const { protect } = require("../middleware/authMiddleware.js"); // apna existing auth middleware
const upload = require("../middleware/upload.js");

router.use(protect);

// "image" wahi field name hona chahiye jo frontend FormData me use ho raha hai
router.put("/profile", upload.single("image"), updateProfile);
router.delete("/account", deleteAccount);

module.exports = router;