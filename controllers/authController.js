const { models } = require("mongoose");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    res.status(200).json({ status: 200, message: "Register success" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "Register failed" });
  }
};

const login = async (req, res) => {
  try {
    res.status(200).json({ status: 200, message: "Login success" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "Login failed" });
  }
};
const forgotPassword = async (req, res) => {
  try {
    res.status(200).json({ status: 200, message: "ForgotPassword success" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "forgotPassword failed" });
  }
};
const resetPassword = async (req, res) => {
  try {
    res.status(200).json({ status: 200, message: "ResetPassword success" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "ResetPassword failed" });
  }
};

const getAllUser = async (req, res) => {
  try {
    res.status(200).json({ status: 200, message: "GetAllUser success" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "GetAllUser failed" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    res.status(200).json({ status: 200, message: "GetUserProfile success" });
  } catch (err) {
    res.status(500).json({ status: 500, message: "GetUserProfile failed" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUser,
  getUserProfile,
};
