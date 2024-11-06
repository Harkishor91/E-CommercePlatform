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

const getVendorOwnStore = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.userId;

    let storeFilter = {};
    if (userRole === "vendor") {
      // Vendors see only stores they created
      storeFilter.vendorId = userId;
    }
    //  all store visible for all users
    const stores = await Store.find(storeFilter)
      .populate(
        "vendorId",
        "firstName lastName email role isVerify profileImage"
      )
      .lean();

    // Transform the response to rename vendorId to vendorInfo
    const transformedStores = stores.map((store) => {
      const { vendorId, ...otherFields } = store;
      return { ...otherFields, vendorInfo: vendorId };
    });

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      messgae: "Vendor fetch their store data successfully",
      stores: transformedStores,
      totalStores: transformedStores.length,
    });
  } catch (error) {
    return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({
      status: statusCodes.INTERNAL_SERVER_ERROR,
      messgae: "Vendor Failed to get their store",
    });
  }
};
const getAllStore = async (req, res) => {
  try {
    //  all store visible for all users
    const stores = await Store.find({})
      .populate(
        "vendorId",
        "firstName lastName email role isVerify profileImage"
      )
      .lean();

    // Transform the response to rename vendorId to vendorInfo
    const transformedStores = stores.map((store) => {
      const { vendorId, ...otherFields } = store;
      return { ...otherFields, vendorInfo: vendorId };
    });

    return res.status(statusCodes.OK).json({
      status: statusCodes.OK,
      messgae: "Fetch store data successfully",
      stores: transformedStores,
      totalStores: transformedStores.length,
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
    const userRole = req.user.role;
    const userId = req.user.userId;
    const { storeId } = req.params;

    // Find the store by its ID
    const store = await Store.findById(storeId);

    // Check if store exists
    if (!store) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "Store not found",
      });
    }

    // Only allow vendors to update their own stores or admins to update any store
    if (
      userRole === "vendor" &&
      store.vendorId.toString() !== userId.toString()
    ) {
      return res.status(statusCodes.FORBIDDEN).json({
        status: statusCodes.FORBIDDEN,
        message: "You cannot update another vendor's store",
      });
    }

    // Restrict customers from updating any store
    if (userRole === "customer") {
      return res.status(statusCodes.FORBIDDEN).json({
        status: statusCodes.FORBIDDEN,
        message: "Customers are not authorized to update stores",
      });
    }

    // Update the store with data from the request body
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
  try {
    const userRole = req.user.role;
    const userId = req.user.userId;
    const { storeId } = req.params;

    // Find the store by its ID
    const store = await Store.findById(storeId);

    // Check if store exists
    if (!store) {
      return res.status(statusCodes.NOT_FOUND).json({
        status: statusCodes.NOT_FOUND,
        message: "Store not found",
      });
    }

    // Vendors can delete only their own stores, admins can delete any store
    if (
      userRole === "vendor" &&
      store.vendorId.toString() !== userId.toString()
    ) {
      return res.status(statusCodes.FORBIDDEN).json({
        status: statusCodes.FORBIDDEN,
        message: "You cannot delete another vendor's store",
      });
    }

    // Restrict customers from deleting any store
    if (userRole === "customer") {
      return res.status(statusCodes.FORBIDDEN).json({
        status: statusCodes.FORBIDDEN,
        message: "Customers are not authorized to delete stores",
      });
    }

    // Delete the store from the database
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
  getVendorOwnStore,
  getAllStore,
  updateStore,
  deleteStore,
};
