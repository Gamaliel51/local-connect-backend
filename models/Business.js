const { DataTypes } = require('sequelize')
const sequelize = require('../config/connectDB')


const Business = sequelize.define('Business', {
    email: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    about: {
        type: DataTypes.STRING // business description
    },
    address: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING,
        defaultValue: "+234 800 000 0000",
        allowNull: true
    },
    location: {
        type: DataTypes.ARRAY(DataTypes.FLOAT)
    },
    category: {
        type: DataTypes.STRING
    },
    profileImageUrl: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    },
})


module.exports = Business