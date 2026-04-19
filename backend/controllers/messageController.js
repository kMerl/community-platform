const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

const getConversationFilter = (currentUserId, otherUserId) => ({
    $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
    ]
});

exports.getConversations = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id },
                { recipient: req.user.id }
            ]
        })
            .populate("sender", "name")
            .populate("recipient", "name")
            .sort({ createdAt: -1 });

        const conversations = [];
        const seen = new Set();

        messages.forEach((message) => {
            const senderId = message.sender?._id?.toString();
            const recipientId = message.recipient?._id?.toString();
            const otherUser = senderId === req.user.id ? message.recipient : message.sender;
            const otherUserId = otherUser?._id?.toString();

            if (!otherUserId || seen.has(otherUserId)) return;

            seen.add(otherUserId);
            conversations.push({
                user: otherUser,
                lastMessage: message,
                updatedAt: message.createdAt,
                mine: senderId === req.user.id || recipientId !== req.user.id
            });
        });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const otherUser = await User.findById(req.params.userId).select("name bio reputation createdAt");

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

        await Notification.create({
            recipient: req.params.userId,
            actor: req.user.id,
            type: "message",
            message: message._id,
            text: `${populated.sender.name} sent you a message`,
            link: `/messages/${req.user.id}`
        });

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
