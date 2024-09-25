const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: 400,
        message:
          "All required fields (firstName, lastName, email, password) must be provided.",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ status: 400, message: `${email} already exists` });
    }
    // Handle the uploaded image
    let profileImagePath = null;
    if (req.file) {
      profileImagePath = req.file.filename; // Get the file name
    }
    // Save image path only if the file is uploaded
    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      profileImage: profileImagePath, // Save image path if file exists
    });

    // Save user to database
    await user.save();

    // Generate JWT
    const token = user.createJWT();

    // Return success response
    return res.status(201).json({
      status: 201,
      message: "Register success",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage, // Should reflect the image path
      },
      token,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "User Registeration  failed",
      error: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: 400, message: "All fields are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Validate password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = user.createJWT();
    const userInfo = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage,
    };

    // Send response
    return res.status(200).json({
      status: 200,
      message: "User logged in successfully",
      user: userInfo,
      token,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, message: "Login failed", error: err.message });
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
    const userId = req.user.userId; // get current login  userId
    const users = await User.find({ _id: { $ne: userId } }); // remove current login user from list
    return res.status(200).json({
      status: 200,
      messsage: "User list fetch successfully",
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "GetAllUser failed", error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: `UserId is not found` });
    } else {
      // Return the user profile (excluding the password)
      return res
        .status(200)
        .json({ status: 200, message: "User Data fetch successfully", user }); // Return the user data
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, message: "GetUserProfile failed", err });
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
