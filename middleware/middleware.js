const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt')
const settings = require("../config/settings");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Business = require("../models/Business");
const User = require("../models/User");

const verifyUserToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), settings.accesskey);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

const verifyBusinessToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), settings.accesskey);
        req.business = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

async function createSampleRecords() {
    try {
        // Check if Sample User Exists
        const existingUser = await User.findOne({ where: { email: settings.sample_user.email } });
        if (!existingUser) {
            const hashedUserPassword = await bcrypt.hash(settings.sample_user.password, 10);
            await User.create({
                ...settings.sample_user,
                password: hashedUserPassword,
            });
            console.log("Sample User Created:", settings.sample_user.email);
        }

        // Check if Business Exists
        const existingBusiness = await Business.findOne({ where: { email: settings.sample_business.email } });
        if (!existingBusiness) {
            const hashedBusinessPassword = await bcrypt.hash(settings.sample_business.password, 10);
            await Business.create({
                ...settings.sample_business,
                password: hashedBusinessPassword,
            });
            console.log("Sample Business Created:", settings.sample_business.email);
        }

        // Check if Product Exists
        const existingProduct = await Product.findOne({ where: { product_id: settings.sample_product.product_id } });
        if (!existingProduct) {
            await Product.create({...settings.sample_product, price: settings.sample_product.price.toPrecision()});
            console.log("Sample Product Created:", settings.sample_product.name);
        }

        // Check if Order Exists
        const existingOrder = await Order.findOne({ where: { customer: settings.sample_order.customer } });
        if (!existingOrder) {
            await Order.create(settings.sample_order);
            console.log("Sample Order Created:", settings.sample_order.customer);
        }
    } catch (error) {
        console.error("Error creating sample records:", error);
    }
}


module.exports = { verifyUserToken, verifyBusinessToken, createSampleRecords };
