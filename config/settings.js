require('dotenv').config()

const settings = {
    salt: process.env.SALT,
    port: process.env.PORT,
    accesskey: process.env.ACCESS_KEY,
    refreshkey: process.env.REFRESH_KEY,
    app_encryption_algorithm: 'aes-256-cbc',  // process.env.APP_ENCRYPTION_ALGORITHM,
    app_encryption_key: process.env.APP_ENCRYPTION_KEY,
    app_encryption_iv: process.env.APP_ENCRYPTION_IV,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloud_api_key: process.env.CLOUDINARY_API_KEY,
    cloud_api_secret: process.env.CLOUDINARY_API_SECRET,
    database: process.env.DATABASE,
    db_user: process.env.DATABASE_USER,
    db_password: process.env.DATABASE_PASSWORD,
    db_host: process.env.DATABASE_HOST,
    db_port: process.env.DATABASE_PORT,
    db_ssl: process.env.DATABASE_SSL,

    sample_user: {
        email: "john.doe@example.com",
        name: "John Doe",
        password: "securepassword",
        address: "789 Elm Street, CA",
        profileImageUrl: "https://example.com/images/profile.jpg"
    },
    sample_business: {
        email: "bestshop@example.com",
        name: "Best Shop",
        password: "securepassword",
        about: "We sell quality products at affordable prices.",
        address: "123 Market Street, NY",
        profileImageUrl: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/company-logo-design-template-e089327a5c476ce5c70c74f7359c5898_screen.jpg?ts=1672291305",
        location: [40.7128, -74.0060],
        category: "Retail",
        active: true,
        tags: ["electronics", "fashion", "home"]
    },
    sample_product: {
        business_owned: "bestshop@example.com",
        name: "Wireless Headphones",
        product_id: "P123456",
        about: "Noise-cancelling wireless headphones with great battery life.",
        price: 99.99,
        imageUrl: "https://greendroprecycling.com/wp-content/uploads/2017/04/GreenDrop_Station_Aluminum_Can_1-300x300.jpg",
        available: true,
        tags: ["electronics", "audio", "wireless"]
    },
    sample_order: {
        order_id: crypto.randomUUID(),
        business_owned: "bestshop@example.com",
        customer: "john.doe@example.com",
        product_list: ["P123456", "P654321"],
        collection_method: "delivery",
        customer_notes: ["Deliver to 456 Elm Street", "Leave at the front door"],
        status: ["initiated"]
    }
}


module.exports = settings