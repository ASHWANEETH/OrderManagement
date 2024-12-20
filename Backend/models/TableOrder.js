const mongoose = require("mongoose");

const tableOrderSchema = new mongoose.Schema({
  tableId: Number,
  orders: [
    {
      itemName: String,
      quantity: Number,
      price: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TableOrder", tableOrderSchema);
