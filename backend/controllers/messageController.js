const Message = require("../models/Message");
const User = require("../models/User");

const getConversationFilter = (currentUserId, otherUserId) => ({
    $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
    ]
});

exports.getConversation = async (req, res) => {
    try {
        const otherUser = await User.findById(req.params.userId).select("name email bio reputation createdAt");

        if (!otherUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const messages = await Message.find(getConversationFilter(req.user.id, req.params.userId))
            .populate("sender", "name")
            .populate("recipient", "name")
            .sort({ createdAt: 1 });

        res.json({ user: otherUser, messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const cleanText = typeof text === "string" ? text.trim() : "";

        if (!cleanText) {
            return res.status(400).json({ message: "Message cannot be empty" });
        }

        if (req.user.id === req.params.userId) {
            return res.status(400).json({ message: "You cannot message yourself" });
        }

        const recipient = await User.findById(req.params.userId);

        if (!recipient) {
            return res.status(404).json({ message: "User not found" });
        }

        const message = await Message.create({
            sender: req.user.id,
            recipient: req.params.userId,
            text: cleanText.slice(0, 1000)
        });

        const populated = await message.populate([
            { path: "sender", select: "name" },
            { path: "recipient", select: "name" }
        ]);

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
