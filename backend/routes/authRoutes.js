const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
    register,
    login,
    getCurrentUser,
    updateCurrentUser,
    searchUsers
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", searchUsers);
router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateCurrentUser);

module.exports = router;
