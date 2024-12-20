const express = require("express");

const {handleGetBill,handlePutBill,handleRemBill} = require("../controllers/billsHandle")

const router = express.Router();

router.get("/",handleGetBill);
router.post("/",handlePutBill);
router.delete("/",handleRemBill);

module.exports = router;