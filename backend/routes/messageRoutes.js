const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
    getConversations,
    getConversation,
    sendMessage
} = require("../controllers/messageController");

router.get("/", auth, getConversations);
router.get("/:userId", auth, getConversation);
router.post("/:userId", auth, sendMessage);

module.exports = router;
