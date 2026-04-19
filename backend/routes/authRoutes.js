const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
    register,
    login,
    getCurrentUser,
    updateCurrentUser,
    searchUsers,
    sendOTP,
    verifyOTP
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.get("/users", searchUsers);
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateCurrentUser);

module.exports = router;
