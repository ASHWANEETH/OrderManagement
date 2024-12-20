const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://rollexjhony:Ashwa1234@cluster0.rk45z.mongodb.net/orderManage?retryWrites=true&w=majority&appName=Cluster0");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if the connection fails
  }
};

module.exports = connectDB;
