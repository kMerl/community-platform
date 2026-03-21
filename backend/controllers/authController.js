const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

        res.json(user);

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

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );

        res.json({token});

    } catch(err){
        res.status(500).json({error: err.message});
    }
};