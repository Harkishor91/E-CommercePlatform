const User = require("../models/User");
const statusCodes = require("../utils/statusCode");
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !password) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message:
          "All required fields (firstName, lastName, email, password) must be provided.",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({
          status: statusCodes.BAD_REQUEST,
          message: `${email} already exists`,
        });
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
    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
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
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
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
        .status(statusCodes.BAD_REQUEST)
        .json({
          status: statusCodes.BAD_REQUEST,
          message: "All fields are required",
        });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(statusCodes.NOT_FOUND)
        .json({ status: statusCodes.NOT_FOUND, message: "User not found" });
    }

    // Validate password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res
        .status(statusCodes.BAD_REQUEST)
        .json({
          status: statusCodes.BAD_REQUEST,
          message: "Invalid credentials",
        });
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
    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "User logged in successfully",
      user: userInfo,
      token,
    });
  } catch (err) {
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: "Login failed",
        error: err.message,
      });
  }
};

const forgotPassword = async (req, res) => {
  try {
    res
      .status(statusCodes.OK)
      .json({ status: statusCodes.OK, message: "ForgotPassword success" });
  } catch (err) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: "forgotPassword failed",
      });
  }
};
const resetPassword = async (req, res) => {
  try {
    res
      .status(statusCodes.OK)
      .json({ status: statusCodes.OK, message: "ResetPassword success" });
  } catch (err) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: "ResetPassword failed",
      });
  }
};

const getAllUser = async (req, res) => {
  try {
    const userId = req.user.userId; // get current login  userId
    const users = await User.find({ _id: { $ne: userId } }); // remove current login user from list
    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      messsage: "User list fetch successfully",
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: "GetAllUser failed",
        error,
      });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(statusCodes.NOT_FOUND)
        .json({
          status: statusCodes.NOT_FOUND,
          message: `UserId is not found`,
        });
    } else {
      // Return the user profile (excluding the password)
      return res
        .status(statusCodes.OK)
        .json({
          status: statusCodes.OK,
          message: "User Data fetch successfully",
          user,
        }); // Return the user data
    }
  } catch (err) {
    return res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: "getUserDetail failed",
        err,
      });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUser,
  getUserDetail,
};
