const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
 const storeRoutes = require("./routes/storeRoutes")
dotenv.config();
const app = express();
 // Connect to the database
 connectDB();
// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors()); // For enabling CORS
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;


// Routes
app.use(`/${process.env.API_BASE_URL}/auth`, authRoutes);
app.use(`/${process.env.API_BASE_URL}/store`, storeRoutes);



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
