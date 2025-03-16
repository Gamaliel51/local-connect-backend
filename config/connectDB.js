const { Sequelize } = require("sequelize");
const settings = require("./settings");

const sequelize = new Sequelize(settings.database, settings.db_user, settings.db_password, {
    host: settings.db_host,
    port: settings.db_port,
    dialect: 'postgres',
    dialectOptions: {
        ssl: settings.db_ssl,
    }
})


sequelize.authenticate().then(() => {
    console.log("Database Connection Successful")
})


module.exports = sequelize