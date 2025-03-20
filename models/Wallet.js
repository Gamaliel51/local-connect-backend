const { DataTypes } = require('sequelize')
const sequelize = require('../config/connectDB')


const Wallet = sequelize.define('Wallet', {
    business_email: {
        type: DataTypes.STRING, // email of business that owns wallet
    },
    amount: {
        type: DataTypes.FLOAT
    },
    transactions: {
        type: DataTypes.ARRAY(DataTypes.JSON) // array of json in structure {'from': customer_email, 'to': wallet, 'amount': 24122} or {'from': wallet, 'to': personal account, 'amount': 24122}
    },
})


module.exports = Wallet