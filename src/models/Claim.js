const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
    {
        claimId: {
            type: String,
            required: true,
            unique: true
        },

        donationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Donation",
            required: true
        },

        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO",
            required: true
        },

        status: {
            type: String,
            enum: [
                "CLAIMED",
                "PICKED_UP",
                "DELIVERED"
            ],
            default: "CLAIMED"
        },

        claimedAt: {
            type: Date,
            default: Date.now
        },

        pickedUpAt: {
            type: Date,
            default: null
        },

        deliveredAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Claim", claimSchema);