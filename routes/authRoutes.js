/** @format */

const express = require("express");
const router = express.Router();
const { signup, login, getProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", signup);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.post("/logout", protect, (req, res) => {

 
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
