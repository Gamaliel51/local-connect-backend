const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");

const Cart = sequelize.define("Cart", {
  user: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  // Here we store an array of product objects in JSON format.
  products: {
    type: DataTypes.JSON, // expects an array
    defaultValue: [],
  },
});

module.exports = Cart;
