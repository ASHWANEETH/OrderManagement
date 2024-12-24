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
    const { tableId, itemName, quantity } = req.body; // Assuming itemName and quantity are provided to identify the item to remove
  
    // Find the table by tableId
    const table = await TableOrder.findOne({ tableId: tableId });
    
    if (!table) {
      return res.status(404).send("Table not found.");
    }
  
    // Locate the index of the first matching item
    const itemIndex = table.orders.findIndex(
      (order) => order.itemName === itemName && order.quantity === quantity
    );
  
    // If the item is not found
    if (itemIndex === -1) {
      return res.status(404).send("Item not found in orders.");
    }
  
    // Remove the first occurrence of the matching item
    table.orders.splice(itemIndex, 1);
  
    // Save the updated document
    await table.save();
  
    // Respond with the updated order
    res.status(200).json(table.orders);
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
