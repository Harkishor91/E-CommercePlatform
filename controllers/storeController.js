const Store = require("../models/Store");

const addStore = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { name, description, vendorId } = req.body;
    if (userRole === "admin" || userRole === "vendor") {
      if (!name || !description || !vendorId) {
        return res.status(400).json({
          status: 400,
          message: "All fields are required (name,description,vendorId)",
        });
      } else {
        // Handle the uploaded image
        let storeImagePath = null;
        if (req.file) {
          storeImagePath = req.file.filename; // Get the file name
        }
        const store = new Store({
          name,
          description,
          vendorId,
          storeImage: storeImagePath,
        });
        // Save store to database
        await store.save();
        res
          .status(200)
          .json({ status: 200, message: "Store created successfully", store });
      }
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "You are not authorize to add store" });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, messgae: "added store failed" });
  }
};

const getAllStore = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: 200, messgae: "getAllStore  success" });
  } catch (error) {
    return res.status(500).json({ status: 500, messgae: "getAllStore failed" });
  }
};
const updateStore = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: 200, messgae: "updateStore success" });
  } catch (error) {
    return res.status(500).json({ status: 500, messgae: "updateStore failed" });
  }
};
const deleteStore = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ status: 200, messgae: "deleteStore success" });
  } catch (error) {
    return res.status(500).json({ status: 500, messgae: "deleteStore failed" });
  }
};

module.exports = {
  addStore,
  getAllStore,
  updateStore,
  deleteStore,
};
