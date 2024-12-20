const express = require("express");
const {handlePutNotifications,handleGetNotifications} = require("../controllers/notificationHandle")

const router = express.Router();

// Route to get all notifications
router.get("/", handleGetNotifications);

// Route to add a notification
router.post("/", handlePutNotifications );

module.exports = router;
