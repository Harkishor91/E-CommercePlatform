const express = require("express");
const router = express.Router();
const {
  addStore,
  getAllStore,
  updateStore,
  deleteStore,
} = require("../controllers/storeController");

// use middlewares 
const authMiddleware = require("../middlewares/authentication");
const upload = require("../middlewares/upload");

// route for add store
router.post("/addStore", authMiddleware,upload.single('storeImage') ,addStore);

// route for get all stores
router.get("/getAllStore", getAllStore);

// route for update route
router.put("/updateStore/:id", updateStore);

// route for delete store
router.delete("/deleteStore/:id", deleteStore);

module.exports = router;
