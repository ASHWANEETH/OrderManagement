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
