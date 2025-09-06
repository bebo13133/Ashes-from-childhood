require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

module.exports = {
    development: {
        url: process.env.DB_URL,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: 'localhost',
        user: process.env.DB_USER,
        port: 5432,
        dialect: 'postgres',
        logging: false,
    },

    production: {
        url: process.env.DATABASE_URL,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
    },
};
