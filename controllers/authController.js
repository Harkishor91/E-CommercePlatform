const User = require("../models/User");
const statusCodes = require("../utils/statusCode");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const sendEmail = require("../middlewares/emailSender");

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
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: `User with email ${email} already exists.`,
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

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP and its expiration (e.g., 5 minutes)
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    // Send OTP via email
    try {
      await sendEmail(email, otp);
      console.log(`OTP sent to email: ${email}`);
    } catch (emailError) {
      console.log("Failed to send OTP email:", emailError);
    }

    // Save user to database
    await user.save();

    // Return success response
    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "User registered successfully. Please verify your email.",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage, // Should reflect the image path
      },
    });
  } catch (err) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to register the user. Please try again.",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "User not found with the provided email.",
      });
    }

    // Verify the OTP
    if (user.verifyOTP(otp)) {
      // Save the changes to the user (isVerify will be true now)
      await user.save();
      return res.status(statusCodes.OK).json({
        message: "OTP verified successfully.",
        status: statusCodes.OK,
      });
    } else {
      return res.status(statusCodes.BAD_REQUEST).json({
        message: "Invalid or expired OTP.",
        status: statusCodes.BAD_REQUEST,
      });
    }
  } catch (err) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to verify OTP. Please try again.",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "User not found with the provided email.",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP and its expiration (e.g., 5 minutes)
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    await user.save(); // Save the updated user object

    // Send OTP via email
    try {
      await sendEmail(email, otp);
      console.log(`OTP sent to email: ${email}`);
    } catch (emailError) {
      console.log("Failed to send OTP email:", emailError);
      return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
        status: statusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to resend OTP. Please try again.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Email and password are required.",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "User not found with the provided email.",
      });
    }

    // Validate password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Invalid credentials",
      });
    }

    // Check if the user is verified
    if (!user.isVerify) {
      // Generate a new OTP
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      // Set OTP and its expiration time
      user.otp = otp;
      user.otpExpiresAt = Date.now() + 5 * 60 * 1000; // Set expiry for 5 minutes
      await user.save(); // Save the updated user

      // Send the OTP via email
      await sendEmail(user.email, otp);
      console.log(`New OTP sent to: ${user.email}`);

      return res.status(statusCodes.UNAUTHORIZED).json({
        status: statusCodes.UNAUTHORIZED,
        message:
          "User is not verified. A new OTP has been sent to your email for verification.",
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
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to log in. Please try again.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "User not found with the provided email.",
      });
    }

    const userInfo = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(userInfo, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    const tokenExpiryTime = 1000 * 60 * 5;
    const passwordTokenExpirationDate = new Date(Date.now() + tokenExpiryTime);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = passwordTokenExpirationDate;
    await user.save();

    // For development/testing, send the token back in the response
    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "Password reset token has been sent to your email.",
      token,
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Forgot Password: Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Please provide all values",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "User not found!",
      });
    }

    if (user.resetPasswordExpires <= Date.now()) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Reset token has expired",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.email !== email) {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "Invalid token",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "Password reset successful",
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(statusCodes.BAD_REQUEST).json({
      status: statusCodes.BAD_REQUEST,
      message: "Invalid or expired token",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const userId = req.user.userId; // get current login  userId
    const users = await User.find({ _id: { $ne: userId } }).select(
      "-otp -otpExpiresAt"
    ); // remove current login user from list
    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      messsage: "User list fetch successfully",
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to get all users. Please try again.",
    });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-otp -otpExpiresAt"
    );
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: `UserId is not found`,
      });
    } else {
      // Return the user profile (excluding the password)
      return res.status(statusCodes.OK).json({
        status: statusCodes.OK,
        message: "User Data fetch successfully",
        user,
      });
    }
  } catch (err) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to get user detail. Please try again.",
      err,
    });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getAllUser,
  getUserDetail,
};
