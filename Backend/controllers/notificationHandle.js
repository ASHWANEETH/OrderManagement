const Notification = require("../models/Notification");

async function handlePutNotifications(req,res) {
  try {
      const { message } = req.body;
      const newNotification = await Notification.findOneAndUpdate({},{ message});
      await newNotification.save();
      res.status(201).json(newNotification);
    } catch (err) {
      res.status(500).send("Error saving notification.");
    }
  
}
async function handleGetNotifications(req,res) {
  try {
      const getNotification = await Notification.findOne();
      res.status(201).json({"message" : getNotification.message});
    } catch (err) {
      res.status(500).send("Error saving notification.");
    }
  
}
module.exports={
  handlePutNotifications,handleGetNotifications,
}