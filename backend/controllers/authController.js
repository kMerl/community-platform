const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendVerificationSuccessEmail } = require("../services/emailService");
const { generateOTP, getOTPExpiry } = require("../utils/otpGenerator");

const buildAuthPayload = (user) => {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
            role: user.role,
            reputation: user.reputation,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt
        }
    };
};

//register user
exports.register = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        //if already exists
        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).json({message: "User already exists"});
        }

        //hash password
        const hashed = await bcrypt.hash(password, 10);

        //create user
        const user = await User.create({
            name, email, password: hashed
        });

        // Generate OTP and expiry
        const otp = generateOTP();
        const otpExpires = getOTPExpiry();

        // Update user with OTP
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, user.name, otp);

        if (!emailResult.success) {
            return res.status(500).json({ message: "User created but failed to send OTP email" });
        }

        res.status(201).json({
            message: "User registered successfully. OTP sent to your email",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                role: user.role,
                reputation: user.reputation,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            }
        });

    } catch(err){
        res.status(500).json({error: err.message});
    }
};

//login
exports.login = async(req, res) => {
    try{
        const{email, password} = req.body;

        const user = await User.findOne({email});
        if (!user) return res.status(400).json({message:"User not found"})
        
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) return res.status(400).json({message: "Invalid password"});

        res.json(buildAuthPayload(user));

    } catch(err){
        res.status(500).json({error: err.message});
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCurrentUser = async (req, res) => {
    try {
        const { name, bio } = req.body;
        const updates = {};

        if (typeof name === "string") {
            updates.name = name.trim();
        }

        if (typeof bio === "string") {
            updates.bio = bio.trim().slice(0, 280);
        }

        if (!updates.name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const query = typeof req.query.search === "string" ? req.query.search.trim() : "";

        if (!query) {
            return res.json([]);
        }

        const users = await User.find({
            name: { $regex: query, $options: "i" }
        })
            .select("name bio reputation createdAt")
            .limit(12)
            .sort({ reputation: -1, createdAt: -1 });

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//send OTP to email
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Generate OTP and expiry
        const otp = generateOTP();
        const otpExpires = getOTPExpiry();

        // Update user with OTP
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        const emailResult = await sendOTPEmail(user.email, user.name, otp);

        if (!emailResult.success) {
            return res.status(500).json({ message: "Failed to send OTP email" });
        }

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP exists and is not expired
        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "OTP not found. Please request a new one" });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one" });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        // Send verification success email
        await sendVerificationSuccessEmail(user.email, user.name);

        // Return token and user (same format as login)
        res.json(buildAuthPayload(user));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
