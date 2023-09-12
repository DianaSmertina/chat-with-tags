const dotenv = require("dotenv");
dotenv.config();
const { Sequelize } = require("sequelize");
const CONNECTION = process.env.CONNECTION;

module.exports = new Sequelize(CONNECTION, {
    port: 5432,
    ssl: true,
    dialectOptions: {
        ssl: {
            require: true,
        },
    },
});
