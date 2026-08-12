const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isLoggedIn = async (req, res, next) => {

    try {

        const { token } = req.cookies;

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Please log in first"
            });

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const foundUser = await User
            .findById(decoded.id)
            .select("-password");

        if (!foundUser) {

            return res.status(401).json({
                success: false,
                message:
                    "User not found. Please log in again"
            });

        }

        req.user = foundUser;

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired login session"
        });
    }
};


// ======================================
// ROLE AUTHORIZATION
// ======================================

const authorize = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Please log in first"
            });

        }

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized for this action"
            });

        }

        next();
    };
};


module.exports = {
    isLoggedIn,
    authorize
};