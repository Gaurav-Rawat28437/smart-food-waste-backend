const mongoose = require("mongoose");

const verifiedMailSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        verifiedAt: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model(
    "VerifiedMail",
    verifiedMailSchema
);