const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  tableId:Number,
  orders:[
    {itemName:String,
    quantity:Number,
    price:Number,
    totalPrice:Number,}
],
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bill", BillSchema);
