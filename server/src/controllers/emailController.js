const emailController = require('express').Router();
const { EmailTemplate, Review, Order, Book } = require('../config/modelsConfig');
const { sendEmail } = require('../utils/emailTemplates');

emailController.post('/send', async (req, res, next) => {
    try {
        const { to, subject, message } = req.body;

        if (!to) {
            return res.status(400).json({
                message: 'Recipient email is required',
            });
        }

        if (!subject || !message) {
            return res.status(400).json({
                message: 'Subject and message are required',
            });
        }

        await sendEmail('personalTemplate', {
            to,
            subject,
            content: message,
        });

        return res.status(200).json({
            message: `Email sent successfully to ${to}`,
        });
    } catch (error) {
        next(error);
    }
});

// ===== EMAIL TEMPLATE CRUD =====

emailController.get('/templates', async (req, res, next) => {
    try {
        const templates = await EmailTemplate.findAll({
            order: [['id', 'ASC']],
        });

        const populatedTemplates = await Promise.all(
            templates.map(async (template) => {
                if (template.name === 'Промоционален имейл') {
                    const [averageRating, totalOrders, bookData] = await Promise.all([
                        Review.getAverageRating(),
                        Order.count({ where: { status: 'completed' } }),
                        Book.findOne({ where: { isActive: true } }),
                    ]);

                    let populatedContent = template.content
                        .replace(/\[Рейтинг\]/g, averageRating)
                        .replace(/\[Брой поръчки\]/g, totalOrders.toString())
                        .replace(/\[Обща цена\]/g, bookData ? bookData.price.toString() : '25');

                    return {
                        ...template.toJSON(),
                        content: populatedContent,
                    };
                }
                return template;
            })
        );

        return res.status(200).json(populatedTemplates);
    } catch (error) {
        next(error);
    }
});

emailController.get('/templates/single/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await EmailTemplate.findByPk(id);

        if (!template) {
            return res.status(404).json({
                message: 'Template not found',
            });
        }

        return res.status(200).json(template);
    } catch (error) {
        next(error);
    }
});

emailController.post('/templates/create', async (req, res, next) => {
    try {
        const { name, subject, content } = req.body;

        if (!name || !subject || !content) {
            return res.status(400).json({
                message: 'Name, subject, and content are required',
            });
        }

        const template = await EmailTemplate.create({
            name,
            subject,
            content,
        });

        return res.status(201).json(template);
    } catch (error) {
        next(error);
    }
});

emailController.put('/templates/update/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, subject, content } = req.body;

        const template = await EmailTemplate.findByPk(id);

        if (!template) {
            return res.status(404).json({
                message: 'Template not found',
            });
        }

        await template.update({
            name: name || template.name,
            subject: subject || template.subject,
            content: content || template.content,
        });

        return res.status(200).json(template);
    } catch (error) {
        next(error);
    }
});

emailController.delete('/templates/single/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await EmailTemplate.findByPk(id);

        if (!template) {
            return res.status(404).json({
                message: `Template with id ${id} does not exist`,
            });
        }

        const templateName = template.name;
        await template.destroy();

        return res.status(200).json({
            message: `Template "${templateName}" with id ${id} was deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = emailController;
