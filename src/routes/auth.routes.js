const express = require("express");
const router = express.Router();

const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const OTP = require("../models/OTP");
const VerifiedMail = require("../models/VerifiedMail");
const User = require("../models/User");

const { sendOTPEmail } = require("../services/emailService");

const { isLoggedIn } = require("../middleware/authMiddleware");

// ==========================================
// GENERATE OTP
// ==========================================

const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};

// ==========================================
// SEND OTP
// ==========================================

router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new Error("Email is required");
        }

        if (!validator.isEmail(email)) {
            throw new Error("Please enter a valid email");
        }

        const normalizedEmail = email
            .toLowerCase()
            .trim();

        // Remove old verification
        await VerifiedMail.deleteOne({
            email: normalizedEmail
        });

        // Remove old OTP
        await OTP.deleteMany({
            email: normalizedEmail
        });

        // Generate OTP
        const otp = generateOTP();

        // Save OTP
        await OTP.create({
            email: normalizedEmail,
            otp: otp
        });

        // Send OTP email
        await sendOTPEmail(
            normalizedEmail,
            otp
        );

        res.status(201).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(
            "Send OTP error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// VERIFY OTP
// ==========================================

router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw new Error(
                "Email and OTP are required"
            );
        }

        const normalizedEmail = email
            .toLowerCase()
            .trim();

        const foundOtp = await OTP.findOne({
            email: normalizedEmail,
            otp: String(otp)
        });

        if (!foundOtp) {
            throw new Error(
                "Invalid or expired OTP"
            );
        }

        // Delete used OTP
        await OTP.deleteOne({
            _id: foundOtp._id
        });

        // Mark email verified
        await VerifiedMail.findOneAndUpdate(
            {
                email: normalizedEmail
            },
            {
                email: normalizedEmail,
                verifiedAt: new Date()
            },
            {
                upsert: true,
                new: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error(
            "Verify OTP error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// SIGNUP
// ==========================================

router.post("/signup", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {
            throw new Error(
                "Please enter all required fields"
            );
        }

        if (!validator.isEmail(email)) {
            throw new Error(
                "Please enter a valid email"
            );
        }

        if (
            !validator.isStrongPassword(password)
        ) {
            throw new Error(
                "Password must contain uppercase, lowercase, number and symbol"
            );
        }

        // Public users can only create DONOR or NGO accounts
        if (
            !["DONOR", "NGO"].includes(role)
        ) {
            throw new Error(
                "Invalid role"
            );
        }

        const normalizedEmail = email
            .toLowerCase()
            .trim();

        // Check email verification
        const verifiedMail =
            await VerifiedMail.findOne({
                email: normalizedEmail
            });

        if (!verifiedMail) {
            throw new Error(
                "Please verify your email first"
            );
        }

        // Check existing user
        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            throw new Error(
                "User already exists"
            );
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                11
            );

        // Create user
        const createdUser =
            await User.create({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role
            });

        // Remove verification record
        await VerifiedMail.deleteOne({
            email: normalizedEmail
        });

        res.status(201).json({
            success: true,
            message:
                "Account created successfully",

            user: {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role
            }
        });

    } catch (error) {
        console.error(
            "Signup error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            throw new Error(
                "Email and password are required"
            );
        }

        const normalizedEmail = email
            .toLowerCase()
            .trim();

        // Find user
        const foundUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (!foundUser) {
            throw new Error(
                "User does not exist"
            );
        }

        // Compare password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                foundUser.password
            );

        if (!isPasswordCorrect) {
            throw new Error(
                "Invalid credentials"
            );
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            throw new Error(
                "JWT_SECRET is not configured"
            );
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: foundUser._id,
                role: foundUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // ======================================
        // IMPORTANT:
        // Vercel frontend + Render backend
        // requires cross-site cookie settings
        // ======================================

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge:
                24 *
                60 *
                60 *
                1000
        });

        console.log(
            "Login successful:",
            foundUser.email
        );

        res.status(200).json({
            success: true,
            message: "Login successful",

            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                role: foundUser.role
            }
        });

    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// LOGOUT
// ==========================================

router.post("/logout", async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        res.status(200).json({
            success: true,
            message:
                "Logged out successfully"
        });

    } catch (error) {
        console.error(
            "Logout error:",
            error.message
        );

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ==========================================
// GET CURRENT USER
// ==========================================

router.get(
    "/me",
    isLoggedIn,
    async (req, res) => {
        try {
            res.status(200).json({
                success: true,

                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role
                }
            });

        } catch (error) {
            console.error(
                "Get current user error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;