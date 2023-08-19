const dotenv = require('dotenv');
dotenv.config();
const password = process.env.DB_PASSWORD;
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'admin',
    password: password,
    host: 'dpg-cjg8c3k1ja0c73anvr80-a.frankfurt-postgres.render.com',
    port: 5432,
    database: 'chat_lfc5',
    ssl: true,
});

module.exports = pool;