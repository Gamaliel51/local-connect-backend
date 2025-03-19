const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Business = require('../models/Business')
const Product = require("../models/Product");
const Order = require("../models/Order");
const { verifyBusinessToken } = require("../middleware/middleware");
const { Op } = require("sequelize");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get products by business email
router.get("/by-business/:business_email", async (req, res) => {
    try {
      const { business_email } = req.params;
      const products = await Product.findAll({
        where: { business_owned: business_email },
      });
      res.json({ products });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Add Product
router.post("/add-product", verifyBusinessToken, upload.single("image"), async (req, res) => {
    try {
        const { name, about, price, tags } = req.body;
        let imageUrl;
        
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "product_images" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }
  
        const product = await Product.create({
            business_owned: req.business.businessId,
            product_id: crypto.randomUUID(),
            name,
            about,
            price,
            imageUrl,
            tags: JSON.parse(tags),
        });
  
        res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// This route expects a valid business token in req.business (from verifyBusinessToken middleware)
router.put("/update/:id", verifyBusinessToken, async (req, res) => {
    try {
      const { id } = req.params;
      // Ensure the product belongs to the business making the request
      const product = await Product.findOne({
        where: { product_id: id, business_owned: req.business.businessId },
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found or unauthorized." });
      }
      // Update allowed fields (e.g., name, about, price, imageUrl, available, tags)
      await Product.update(req.body, { where: { product_id: id } });
      res.json({ message: "Product updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
// Fetch 20 Random Products
router.get("/products-random", async (req, res) => {
    try {
        const products = await Product.findAll({ order: sequelize.random(), limit: 20 });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  
// Fetch Products by Tags
router.post("/products-search", async (req, res) => {
    try {
        const { tags } = req.body;
        const products = await Product.findAll({ where: { tags: { [Op.overlap]: tags } } });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch Product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findOne({ where: { product_id: req.params.id } });
        if (!product) return res.status(404).json({ error: "Product not found" });
        res.json({ product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;