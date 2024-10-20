const express = require("express");
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getAllUser,
  getUserDetail,
} = require("../controllers/authController");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

// Route to register a new user
router.post("/register", upload.single("profileImage"), register);

// Route for verify otp
router.post("/verifyOtp", verifyOtp);

// Route for resend otp
router.post("/resendOtp", resendOtp);

// Route to login a user
router.post("/login", login);

// Routr for forgot password
router.post("/forgotPassword",forgotPassword)

// Route for reset password
router.post("/resetPassword",resetPassword)

// Route to get all users
router.get("/getAllUser", authMiddleware, getAllUser);

// Route to get user profile by userId
router.get("/getUserDetail/:id", authMiddleware, getUserDetail);

module.exports = router;
