const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
    {
        ngoId: {
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

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        foodTypes: {
            type: [String],
            default: []
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

module.exports = mongoose.model("NGO", ngoSchema);