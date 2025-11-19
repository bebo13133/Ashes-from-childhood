const bookController = require('express').Router();
const { Book } = require('../config/modelsConfig');
const isAuth = require('../middlewares/isAuth');

bookController.get('/book-price', async (req, res, next) => {
    try {
        const book = await Book.findOne({
            where: {
                title: 'Пепел от детството',
                isActive: true,
            },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book "Пепел от детството" not found or not active',
            });
        }

        return res.status(200).json({
            price: parseFloat(book.price),
            stock: book.stock || 0,
            bookTitle: book.title,
        });
    } catch (error) {
        next(error);
    }
});

bookController.put('/book-price', isAuth, async (req, res, next) => {
    try {
        const { price } = req.body;

        if (!price || isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid price is required',
            });
        }

        const book = await Book.findOne({
            where: {
                title: 'Пепел от детството',
                isActive: true,
            },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book "Пепел от детството" not found or not active',
            });
        }

        await book.update({ price: parseFloat(price) });

        return res.status(200).json({
            message: `Book price updated to ${price} лв.`,
            price: parseFloat(book.price),
            stock: book.stock || 0,
            bookTitle: book.title,
        });
    } catch (error) {
        next(error);
    }
});

bookController.put('/book-stock', isAuth, async (req, res, next) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || stock === null || isNaN(stock) || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid stock quantity is required',
            });
        }

        const book = await Book.findOne({
            where: {
                title: 'Пепел от детството',
                isActive: true,
            },
        });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book "Пепел от детството" not found or not active',
            });
        }

        await book.update({ stock: parseInt(stock) });

        return res.status(200).json({
            message: `Book stock updated to ${stock}`,
            stock: parseInt(book.stock),
            bookTitle: book.title,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = bookController;
