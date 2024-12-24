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
    const { tableId, orders } = req.body;
    const updatedOrder = await Bill.findOneAndUpdate(
      { tableId: tableId }, 
      { 
        $set: { orders: orders  } // Add the new orders to the orders array
      },
      { 
        new: true,  // Return the updated document
        upsert: true // Create a new document if the table doesn't exist
      }
    );
    await TableOrder.findOneAndUpdate(
      { tableId: tableId },
      { $set: { orders: [] } },
      { new: true } // Return the updated document
    );

      // Construct the message
    let message = `New Order from Table ${tableId}:\n\n`;
    orders.forEach((order) => {
      message += `- ${order.itemName}: ${order.quantity}\n`;
    });

    // Send the message via Telegram
    await bot.sendMessage(chatId, message);

    // Respond with success
    res.status(201).end();
  } catch (err) {
    // console.error(err); // Log error to the console for debugging
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
