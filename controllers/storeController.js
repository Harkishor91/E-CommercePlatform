const Store = require("../models/Store");
const statusCodes = require("../utils/statusCode");
const addStore = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { name, description, address, vendorId } = req.body;
    if (userRole === "admin" || userRole === "vendor") {
      if (!name || !description || !address || !vendorId) {
        return res.status(statusCodes.BAD_REQUEST).json({
          status: statusCodes.BAD_REQUEST,
          message:
            "All fields are required (name,description,address,vendorId)",
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
          address,
          vendorId,
          storeImage: storeImagePath,
        });
        // Save store to database
        await store.save();
        res.status(statusCodes.OK).json({
          status: statusCodes.OK,
          message: "Store created successfully",
          store,
        });
      }
    } else {
      return res.status(statusCodes.BAD_REQUEST).json({
        status: statusCodes.BAD_REQUEST,
        message: "You are not authorize to add store",
      });
    }
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      messgae: "added store failed",
    });
  }
};

const getAllStore = async (req, res) => {
  try {
    //  all store visible for all users
    const stores = await Store.find({});

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      messgae: "Fetch store data successfully",
      stores,
      totalStores: stores.length,
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      messgae: "getAllStore failed",
    });
  }
};

const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    // Find the store by its ID
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "Store not found",
      });
    }

    // Update the store with the data from the request body
    Object.assign(store, req.body);
    await store.save();

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "Store updated successfully",
      store,
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to update store",
      error: error.message,
    });
  }
};

const deleteStore = async (req, res) => {
  const { storeId } = req.params;

  try {
    // Find the store by its ID
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "Store not found",
      });
    }

    // Delete the store if the user is authorized
    await Store.findByIdAndDelete(storeId);

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      message: "Store deleted successfully",
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      message: "Failed to delete store",
      error: error.message,
    });
  }
};
module.exports = {
  addStore,
  getAllStore,
  updateStore,
  deleteStore,
};
