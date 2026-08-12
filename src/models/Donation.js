const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        donationId: {
            type: String,
            required: true,
            unique: true
        },

        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donor",
            required: true
        },

        foodName: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        unit: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        expiryTime: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "CLAIMED",
                "PICKED_UP",
                "DELIVERED",
                "EXPIRED"
            ],
            default: "AVAILABLE"
        },

        // DA will update these later
        priority: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW"],
            default: null
        },

        recommendedNGO: {
            type: String,
            default: null
        },

        reason: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Donation", donationSchema);