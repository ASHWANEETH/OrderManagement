const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const notificationRoutes = require("./routes/notificationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const billRoutes = require("./routes/billRoutes");

import path from "path";


const app = express();
const port = process.env.PORT || 8000;

const _dirname = path.resolve();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: 'order-management-three.vercel.app', 
  methods: 'GET,POST,PUT,DELETE',
}));
app.use(express.json());

// Routes
app.use("/notifications", notificationRoutes);
app.use("/orders", orderRoutes);
app.use("/bills", billRoutes);

app.use(express.static(path.join(_dirname,"/Frontend/dist")))

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
