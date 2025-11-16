const express = require('express');
const path = require('path');

const { port, frontend_server } = require('./envConfig');

const { setupDatabase } = require('../utils/databaseSetup');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsOptions = {
    origin: frontend_server,
    methods: 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

module.exports = function expressConfig(app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors(corsOptions));
    app.use(cookieParser());

    app.use('/uploads/images', express.static(path.join(__dirname, '../uploads/reviewImages')));

    app.listen(port, async () => {
        await setupDatabase();
        console.log(`🚀 Server is listening on port: ${port}`);
    });
};
