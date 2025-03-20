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

// Flutterwave webhook route to receive transaction details
router.post("/flutterwave-webhook", async (req, res) => {
  try {
    const payload = req.body;
    console.log("Flutterwave payload:", payload);

    // Check if the transaction was successful
    if (payload.status === "successful") {
      // For example, get the customer's email from the payload.
      // Adjust this according to how Flutterwave sends the customer info.
      const customerEmail = payload.customer?.email;

      // Update orders for this customer from 'unpaid' to 'paid'
      if (customerEmail) {
        await Order.update(
          { status: ["paid"] },
          { where: { customer: customerEmail, status: ["unpaid"] } }
        );

        // Optionally, update the user's account (e.g. add credits)
        // const user = await User.findOne({ where: { email: customerEmail } });
        // if (user) {
        //   // Update user's credits or perform other actions
        // }
      }
    }
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
  } finally {
    res.status(200).end();
  }
});
  
  
// Create Order
router.post("/create", verifyBusinessToken, async (req, res) => {
    try {
      const { customer, productOrders, collection_method, customer_notes } = req.body;
      if (!customer || !productOrders || !Array.isArray(productOrders)) {
        return res.status(400).json({ error: "Invalid request data." });
      }

      const orderID = crypto.randomUUID()
  
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
          order_id: orderID, 
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