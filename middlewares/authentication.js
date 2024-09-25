const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware function for User Authentication
const auth = async (req, res, next) => {
  // Check if the Authorization header is present and starts with 'Bearer'
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res
      .status(401)
      .json({ status: 401, message: "Authentication invalid" });
  }

  // Extract the token using Authorization header
  const token = authHeader.split(" ")[1];
  try {
    // Verify the JWT token using secret key
    const userInfo = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database using the correct userId
    const user = await User.findById(userInfo.userId).select("-password");

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Set the authenticated user information in the request object
    req.user = {
      userId: user._id, // Use user._id instead of userInfo.userId
      firstName: user.firstName, // Use user data from DB instead of JWT payload
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res
      .status(403)
      .json({ status: 403, message: "Authentication failed", error });
  }
};

module.exports = auth;
