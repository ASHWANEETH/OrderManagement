const TableOrder = require("../models/TableOrder");

async function handleGetOrder(req,res) {
  try {
    const orders = await TableOrder.find({},{tableId:1,orders:1,_id:0});
    res.json(orders);
  } catch (err) {
    res.status(500).send("Error fetching table orders.");
  }
}

async function handleAddItem(req, res) {
  try {
    const { tableId, orders } = req.body;
    // Use await to ensure we get the result of the findOneAndUpdate operation
    const updatedOrder = await TableOrder.findOneAndUpdate(
      { tableId: tableId }, // Search condition
      { 
        $push: { orders: { $each: orders } } // Add the new orders to the orders array
      },
      { 
        new: true,  // Return the updated document
        upsert: true // Create a new document if the table doesn't exist
      }
    );
    res.status(201).json(updatedOrder.orders);
  } catch (err) {
    console.error(err); // Log error to the console for debugging
    res.status(500).send("Error saving table order.");
  }
}

async function handleRemItem(req, res) {
  try {
    const { tableId,itemName,quantity } = req.body; // Assuming itemName is provided to identify the item to remove

    // Use findOneAndUpdate to find the table by tableId and remove the item from orders array
    const updatedOrder = await TableOrder.findOneAndUpdate(
      { tableId: tableId }, // Search condition to find the table by tableId
      { 
        $pull: { orders: { itemName: itemName,quantity:quantity } } // Remove the item with the specified itemName
      },
      { 
        new: true, // Return the updated document
        upsert: false // Don't create a new document if not found
      }
    );
    // If the table with the given tableId is not found
    if (!updatedOrder) {
      return res.status(404).send("Table not found.");
    }

    // Respond with the updated order
    res.status(200).json(updatedOrder.orders);
  } catch (err) {
    console.error(err); // Log error to the console for debugging
    res.status(500).send("Error removing item from table order.");
  }
}

module.exports={
  handleGetOrder,
  handleAddItem,
  handleRemItem
}