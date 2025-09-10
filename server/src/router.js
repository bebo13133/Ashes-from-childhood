const router = require('express').Router();

const errorHandler = require('./middlewares/errorHandler');
const authController = require('./controllers/authController');
const orderController = require('./controllers/orderController');
const bookController = require('./controllers/bookController');

router.use('/auth', authController);
router.use('/orders', orderController);
router.use('/books', bookController);

router.use((err, req, res, next) => {
    errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;
