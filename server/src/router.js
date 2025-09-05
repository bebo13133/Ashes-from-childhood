const router = require('express').Router();

const errorHandler = require('./middlewares/errorHandler');

router.use((err, req, res, next) => {
    errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;
