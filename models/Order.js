const { DataTypes, STRING } = require('sequelize')
const sequelize = require('../config/connectDB')


const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.STRING,
    },
    business_owned: {
        type: DataTypes.STRING, // business email
    },
    customer: {
        type: DataTypes.STRING  // user/customer email
    },
    product_list: {
        type: DataTypes.ARRAY(DataTypes.STRING) // array of product ids
    },
    collection_method: {
        type: DataTypes.STRING, // delivery, or onsite collection
        allowNull: false,
        defaultValue: 'onsite',
        validate: {
            isIn: [['onsite', 'delivery']],
            notEmpty: true
        }
    },
    customer_notes: {
        type: DataTypes.ARRAY(DataTypes.STRING) // includes things like address, instruction, etc
    },
    status: {
        type: DataTypes.ARRAY(STRING), // from received to inprogress or whatever the business decides until complete
        defaultValue: ['unpaid']
    },
    // available: {
    //     type: DataTypes.BOOLEAN,
    //     defaultValue: true
    // },
    // tags: {
    //     type: DataTypes.ARRAY(DataTypes.STRING)
    // },
})


module.exports = Order