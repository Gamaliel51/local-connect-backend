const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/connectDB');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes')
const settings = require('./config/settings');
const sequelize = require('./config/connectDB');

const Business = require('./models/Business');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const { createSampleRecords } = require('./middleware/middleware');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/order', orderRoutes);
app.use('/product', productRoutes);
app.use('/cart', cartRoutes)

sequelize.sync().then(() => {
    app.listen(settings.port, () => {
        createSampleRecords()
        console.log(`Server running on port ${settings.port}`)
    });
})
.catch(err => {
    console.error("SYNC ERROR: ", err)
})