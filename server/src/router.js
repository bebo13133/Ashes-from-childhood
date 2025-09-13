const router = require('express').Router();

const errorHandler = require('./middlewares/errorHandler');
const authController = require('./controllers/authController');
const orderController = require('./controllers/orderController');
const bookController = require('./controllers/bookController');
const reviewController = require('./controllers/reviewController');
const emailController = require('./controllers/emailController');

router.use('/auth', authController);
router.use('/orders', orderController);
router.use('/books', bookController);
router.use('/reviews', reviewController);
router.use('/emails', emailController);

router.use((err, req, res, next) => {
    errorHandler(err, req, res, err.statusCode || 500);
});

module.exports = router;
