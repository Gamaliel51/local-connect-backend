const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Business = require('../models/Business')
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyBusinessToken, verifyUserToken } = require("../middleware/middleware");
const Wallet = require("../models/Wallet");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const updateOrderAndWallet = async (payload) => {
  if (payload.status === "successful") {
    // Extract necessary details from the payload
    const customerEmail = payload.customer.email;
    const orderID = payload.txRef;
    const transAmount = Number(payload.amount);

    console.log("Transaction Successful:", customerEmail, orderID);

    // Find all orders for this customer with the given order ID
    const orders = await Order.findAll({
      where: { customer: customerEmail, order_id: orderID },
    });
    console.log("Orders to update:", orders);

    // Process each order
    for (const order of orders) {
      // Get the business email from the order
      const businessEmail = order.business_owned;
      
      // Update the order status to 'paid'
      order.status = ["paid"];
      await order.save();

      if (businessEmail) {
        // Find the wallet for the business
        let wallet = await Wallet.findOne({ where: { business_email: businessEmail } });
        if (!wallet) {
          // Create a new wallet if one doesn't exist
          wallet = await Wallet.create({
            business_email: businessEmail,
            amount: 0,
            transactions: [],
          });
        }

        // Build the transaction record
        const transaction = {
          from: customerEmail,
          to: businessEmail,
          amount: transAmount,
          orderID,
          date: new Date(),
        };

        // Update the wallet
        wallet.amount += transAmount;
        wallet.transactions = [...(wallet.transactions || []), transaction];
        await wallet.save();
      }
    }
  }
};

// Fetch All Orders for a Business
router.get("/fetch-orders", verifyBusinessToken, async (req, res) => {
    try {
        const orders = await Order.findAll({ where: { business_owned: req.business.businessId } });
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Flutterwave webhook route to receive transaction details
router.post("/flutterwave-webhook", async (req, res) => {
  try {
    const payload = req.body;
    console.log("Flutterwave payload:", payload);

    // Delay processing by 30 seconds (if needed) then update wallet and orders
    setTimeout(() => {
      updateOrderAndWallet(payload);
      res.status(200).end();
    }, 30000);
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    res.status(500).end();
  }
});
  
  
// Create Order
router.post("/create", verifyBusinessToken, async (req, res) => {
    try {
      const { order_id, customer, productOrders, collection_method, customer_notes } = req.body;
      if (!customer || !productOrders || !Array.isArray(productOrders)) {
        return res.status(400).json({ error: "Invalid request data." });
      }
  
      // Group product IDs by business_owned
      const groupedProducts = {};
      productOrders.forEach((order) => {
        const biz = order.business_owned;
        if (!groupedProducts[biz]) {
          groupedProducts[biz] = [];
        }
        groupedProducts[biz].push(order.product_id);
      });
  
      // Create a separate order for each business
      const createdOrders = [];
      for (const biz in groupedProducts) {
        const order = await Order.create({
          // order_id remains blank (or you could assign a generated value if needed)
          order_id: order_id, 
          business_owned: biz,
          customer,
          product_list: groupedProducts[biz],
          collection_method,
          customer_notes,
          status: ["unpaid"],
        });
        createdOrders.push(order);
      }
  
      res.status(201).json({ message: "Orders created successfully", orders: createdOrders });
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
  

module.exports = router;