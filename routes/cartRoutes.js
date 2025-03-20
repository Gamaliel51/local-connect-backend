const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Get cart for a user
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let cart = await Cart.findOne({ where: { user: email } });
    if (!cart) {
      cart = await Cart.create({ user: email, products: [] });
    }
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product to cart
router.post("/add", async (req, res) => {
  try {
    const { user, product } = req.body; // product is an object containing at least product_id, name, price, imageUrl, etc.
    let cart = await Cart.findOne({ where: { user } });
    if (!cart) {
      cart = await Cart.create({ user, products: [product] });
    } else {
      const updatedProducts = cart.products || [];
      updatedProducts.push(product);
      cart.products = updatedProducts;
      await cart.save();
    }
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove product from cart
router.delete("/remove", async (req, res) => {
  try {
    const { user, productId } = req.body;
    let cart = await Cart.findOne({ where: { user } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }
    cart.products = (cart.products || []).filter(
      (p) => p.product_id !== productId
    );
    await cart.save();
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart after checkout
router.delete("/clear/:user", async (req, res) => {
  try {
    const { user } = req.params;
    let cart = await Cart.findOne({ where: { user } });
    if (cart) {
      cart.products = [];
      await cart.save();
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
