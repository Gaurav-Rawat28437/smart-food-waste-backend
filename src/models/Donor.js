const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    donorId: {
      type: String,
      required: true,
      unique: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    organizationName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    location: {
      latitude: Number,
      longitude: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Donor", donorSchema);