const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

        res.status(201).json(buildAuthPayload(user));

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
