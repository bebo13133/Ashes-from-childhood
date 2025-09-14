const orderController = require('express').Router();
const { Order, Book, Notification } = require('../config/modelsConfig');
const { Op } = require('sequelize');
const isAuth = require('../middlewares/isAuth');
const { sendEmail } = require('../utils/emailTemplates');

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

        await Notification.create({
            type: 'order',
            message: `Нова поръчка от ${order.customerName} за "${order.bookTitle}" (${order.quantity} бр.) - ${order.totalPrice} лв.`,
            related_id: order.id,
        });

        sendEmail('personalTemplate', {
            to: process.env.admin_email,
            subject: `Нова поръчка #${order.id}`,
            content: `Нова поръчка от ${order.customerName} за "${order.bookTitle}" (${order.quantity} бр.) - ${order.totalPrice} лв.`,
        }).catch((error) => {
            console.error('Failed to send order notification email:', error);
        });

        const { bookId, priceAtOrder, ...orderData } = order.toJSON();
        return res.status(201).json({
            ...orderData,
            totalPrice: order.totalPrice,
        });
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
                { phone: { [Op.iLike]: `%${search}%` } },
                { address: { [Op.iLike]: `%${search}%` } },
                { city: { [Op.iLike]: `%${search}%` } },
                { orderNumber: { [Op.iLike]: `%${search}%` } },
                { bookTitle: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset,
        });

        return res.status(200).json({
            orders: orders.map((order) => {
                const { bookId, priceAtOrder, ...orderData } = order.toJSON();
                return {
                    ...orderData,
                    totalPrice: order.totalPrice,
                };
            }),
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

        const { bookId, priceAtOrder, ...orderData } = order.toJSON();
        return res.status(200).json({
            ...orderData,
            totalPrice: order.totalPrice,
        });
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

        const { bookId, priceAtOrder, ...orderData } = order.toJSON();
        return res.status(200).json({
            ...orderData,
            totalPrice: order.totalPrice,
        });
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
                message: `Order with id ${id} does not exist`,
            });
        }

        const orderNumber = order.orderNumber;
        const customerName = order.customerName;

        await order.destroy();

        return res.status(200).json({
            message: `${orderNumber} with id ${id} by ${customerName} was deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = orderController;
