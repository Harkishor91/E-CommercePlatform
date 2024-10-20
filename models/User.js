const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Ensure jwt is required

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      default: "customer",
    },
    profileImage: {
      type: String, // URL of the image
      // default: null, // Set default to null
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String, // Store the generated OTP
    },
    otpExpiresAt: {
      type: Date, // Store OTP expiration time
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (comparePassword) {
  return bcrypt.compare(comparePassword, this.password);
};

// Method to create JWT
userSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      profileImage: this.profileImage,
      isVerify:this.isVerify
      // not show password in response
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};


// Method to verify OTP
userSchema.methods.verifyOTP = function (enteredOtp) {
  const currentTime = new Date();
  // Check if OTP is correct and not expired
  if (enteredOtp === this.otp && currentTime < this.otpExpiresAt) {
    this.isVerify = true;
    this.otp = null; // Clear OTP after successful verification
    this.otpExpiresAt = null;
    return true;
  }
  return false;
};


module.exports = mongoose.model("User", userSchema);
