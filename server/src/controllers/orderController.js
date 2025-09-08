const orderController = require('express').Router();
const { Order, Book } = require('../config/modelsConfig');
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const { transformOrderData, transformOrdersData } = require('../utils/transformUtils');

orderController.post('/create', async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, address, city, quantity, bookTitle, paymentMethod, orderDate } = req.body;

        const book = await Book.getBookByTitle(bookTitle);

        if (!book) {
            return res.status(400).json({
                success: false,
                message: `Book "${bookTitle}" not found or not active`,
            });
        }

        const order = await Order.create({
            bookId: book.id,
            customerName: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            address,
            city,
            quantity,
            bookTitle: book.title,
            paymentMethod: paymentMethod || 'cash_on_delivery',
            orderDate: orderDate ? new Date(orderDate) : new Date(),
            priceAtOrder: book.price,
        });

        return res.status(201).json(transformOrderData(order));
    } catch (error) {
        next(error);
    }
});

orderController.get('/all', isAuth, async (req, res, next) => {
    try {
        const { search, status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

        // Build where clause
        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (dateFrom || dateTo) {
            whereClause.createdAt = {};
            if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
            if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
        }

        if (search) {
            whereClause[Op.or] = [
                { customerName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { orderNumber: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Calculate pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
        });

        return res.status(200).json({
            orders: transformOrdersData(orders),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
});

orderController.get('/single/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        return res.status(200).json(transformOrderData(order));
    } catch (error) {
        next(error);
    }
});

orderController.put('/update-status/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Use helper methods for specific status changes
        if (status === 'completed') {
            await order.markAsCompleted();
        } else if (status === 'cancelled') {
            await order.cancel();
        } else if (status === 'pending') {
            await order.update({
                status: 'pending',
                completedAt: null,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: pending, completed, or cancelled',
            });
        }

        return res.status(200).json(transformOrderData(order));
    } catch (error) {
        next(error);
    }
});

orderController.delete('/single/:id', isAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        await order.destroy();

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = orderController;
