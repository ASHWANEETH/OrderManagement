const express = require("express");
const router = express.Router();
const {handleGetOrder,handlePutOrder, handleAddItem,handleRemItem} = require("../controllers/orderHandle")

// Route to get all table orders
router.get("/",handleGetOrder);

// Route to add and remove an order for a table
router.put("/", handleAddItem);
router.delete("/", handleRemItem);


module.exports = router;
