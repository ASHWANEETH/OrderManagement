const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const notificationRoutes = require("./routes/notificationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const billRoutes = require("./routes/billRoutes");

const app = express();
const port = process.env.PORT || 5174;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/notifications", notificationRoutes);
app.use("/orders", orderRoutes);
app.use("/bills", billRoutes);

app.get("/",(req,res)=>{
  res.json({msg:"hi"})
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
