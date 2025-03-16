const { DataTypes } = require("sequelize");
const sequelize = require("../config/connectDB");


const User = sequelize.define('User', {
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
    address: {
        type: DataTypes.STRING
    },
    profileImageUrl: {
        type: DataTypes.STRING
    },
})



module.exports = User