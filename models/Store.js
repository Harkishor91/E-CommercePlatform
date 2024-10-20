const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    storeImage: {
      type: String, // URL of the store image
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Store", storeSchema);
