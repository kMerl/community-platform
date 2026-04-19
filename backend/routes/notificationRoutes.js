const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.patch("/read-all", auth, markAllNotificationsRead);
router.patch("/:id/read", auth, markNotificationRead);

module.exports = router;
