const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const { verifyUserToken } = require("../middleware/middleware");
const settings = require("../config/settings");

const router = express.Router();

// Multer Storage Config (Memory Storage for Cloudinary Uploads)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const { email, name, password, address } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            name,
            password: hashedPassword,
            address,
        });

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user.email }, settings.accesskey, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Profile Route
router.put("/update-profile", verifyUserToken, upload.single("profileImage"), async (req, res) => {
    try {
        const { name, address } = req.body;
        let profileImageUrl;

        const user = await User.findOne({ where: { email: req.user.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (req.file) {
            // Delete previous image from Cloudinary if exists
            if (user.profileImageUrl) {
                const publicId = user.profileImageUrl.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }
            
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "profile_images" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            profileImageUrl = result.secure_url;
        }

        await User.update(
            { name, address, profileImageUrl },
            { where: { email: req.user.userId } }
        );

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Profile Route
router.get("/profile", verifyUserToken, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.user.userId },
            attributes: ["email", "name", "address", "profileImageUrl"],
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
