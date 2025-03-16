const { DataTypes } = require('sequelize')
const sequelize = require('../config/connectDB')


const Product = sequelize.define('Product', {
    business_owned: {
        type: DataTypes.STRING,
    },
    name: {
        type: DataTypes.STRING
    },
    product_id: {
        type: DataTypes.STRING
    },
    about: {
        type: DataTypes.STRING // product description
    },
    price: {
        type: DataTypes.FLOAT
    },
    imageUrl: {
        type: DataTypes.STRING
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
})


module.exports = Product