const notificationController = require('express').Router();
const { Notification } = require('../config/modelsConfig');

notificationController.get('/all', async (req, res, next) => {
    try {
        const notifications = await Notification.findAll({
            order: [['created_at', 'DESC']],
        });

        return res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
});

notificationController.put('/single/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({
                message: 'Notification not found',
            });
        }

        const oldReadStatus = notification.read;

        await notification.update({ read: !notification.read });

        return res.status(200).json({
            message: `Notification marked as ${!oldReadStatus ? 'read' : 'unread'}`,
        });
    } catch (error) {
        next(error);
    }
});

notificationController.put('/mark-all-read', async (req, res, next) => {
    try {
        await Notification.update({ read: true }, { where: { read: false } });

        return res.status(200).json({
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = notificationController;
