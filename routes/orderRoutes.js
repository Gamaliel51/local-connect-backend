const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Business = require('../models/Business')
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyBusinessToken, verifyUserToken } = require("../middleware/middleware");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Fetch All Orders for a Business
router.get("/fetch-orders", verifyBusinessToken, async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { business_owned: req.business.businessId } });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  
// Update Order Status
router.put("/:id", verifyBusinessToken, async (req, res) => {
    try {
        const { status } = req.body;
        await Order.update(
            { status },
            { where: { id: req.params.id, business_owned: req.business.businessId } }
        );
        res.json({ message: "Order status updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  
// Create Order
router.post("/create", verifyUserToken, async (req, res) => {
    try {
        const { business_owned, product_list, collection_method, customer_notes } = req.body;
        
        const order = await Order.create({
            business_owned,
            customer: req.user.userId,
            product_list,
            collection_method,
            customer_notes,
            status: ["initiated"],
        });

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to fetch all orders that belong to a user
router.get("/user/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const orders = await Order.findAll({ where: { customer: email } });
      res.json({ orders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  

module.exports = router;