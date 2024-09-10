const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();
 // Connect to the database
 connectDB();
// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // For enabling CORS
const PORT = process.env.PORT || 5000;


// Routes
app.use(`/${process.env.API_BASE_URL}/auth`, authRoutes);




const startServer = async () => {
  try {
   
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(`Server is not working`);
  }
};

// start server
startServer()
