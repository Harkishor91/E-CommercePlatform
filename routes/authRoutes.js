const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUser,
  getUserProfile,
} = require("../controllers/authController");
const router = express.Router();
const authMiddleware = require("../middlewares/authentication")
const upload = require('../middlewares/upload')


// Route to register a new user
// router.post("/register", register);
router.post('/register', upload.single('profileImage'), register);


// Route to login a user
router.post("/login", login);

// Route to get all users
router.get("/getAllUser", authMiddleware,getAllUser);

// Route to get user profile by userId 
router.get("/getUserProfile/:id",authMiddleware,getUserProfile)

module.exports = router;
