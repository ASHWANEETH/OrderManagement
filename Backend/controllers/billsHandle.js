const TelegramBot = require('node-telegram-bot-api');

// Initialize your Telegram bot with the token
const botToken = '7887952171:AAFXFcd1fmsYOrrL0vt8_AkuacfvDIdgNGs';
const chatId = '1957794102'; // Replace with your chat ID
const bot = new TelegramBot(botToken, { polling: false });

const Bill = require("../models/Bill");
const TableOrder = require("../models/TableOrder");


async function handleGetBill(req,res) {
  try {
    const orders = await Bill.find({},{tableId:1,orders:1,_id:0});
    res.json(orders);
  } catch (err) {
    res.status(500).send("Error fetching bills.");
  }
}


async function handlePutBill(req, res) {
  try {

    const now = new Date();

    // Format the date as "2 Sep 2023"
    const optionsDate = { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" };
    const formattedDate = new Intl.DateTimeFormat("en-IN", optionsDate).format(now);

    // Format the time as "10:00 PM"
    const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" };
    const formattedTime = new Intl.DateTimeFormat("en-IN", optionsTime).format(now);

    const { tableId, orders, totalPrice } = req.body;

    // Update or create a bill in the database
    const updatedOrder = await Bill.findOneAndUpdate(
      { tableId: tableId },
      {
        $set: {
          orders: orders,
          totalPrice: totalPrice, // Use totalPrice from req.body
        },
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if the table doesn't exist
      }
    );

    // Clear the orders for the specified table
    await TableOrder.findOneAndUpdate(
      { tableId: tableId },
      { $set: { orders: [] } },
      { new: true }
    );

    // Construct the Telegram message
    let message = `🧾 *New Bill at Table ${tableId}*\n\n`;
    message += `📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n\n`;
    message += `🧾 *Order Summary*\n\n`;

    // Loop through orders and create message
    orders.forEach((order) => {
      const itemTotal = order.quantity * order.price;
      message += `${order.itemName} --> ( ${order.quantity} x ₹${order.price.toFixed(2)} = ₹${itemTotal.toFixed(2)})\n`;
    });

    message += `\n💰 Total Bill = ₹${totalPrice.toFixed(2)}\n`;

    // Send the message via Telegram
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });


    // Respond with success
    res.status(201).end();
  } catch (err) {
    console.error(err); // Log error to the console for debugging
    res.status(500).send("Error creating bill.");
  }
}


async function handleRemBill(req,res) {
  const {tableId} = req.body;
  try {
    const deletedBill = await Bill.findOneAndDelete({ tableId: tableId });
    res.status(201).end();
    if (deletedBill) {
    } else {
      console.log("No bill found for Table ID:", tableId);
    }

  } catch (error) {
    console.error("Error deleting bill:", error);
  }
}

module.exports={
  handleGetBill,
  handlePutBill,
  handleRemBill,
}
