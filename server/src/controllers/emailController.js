const emailController = require('express').Router();
const { EmailTemplate } = require('../config/modelsConfig');
const { sendEmail } = require('../utils/emailTemplates');

emailController.post('/send', async (req, res, next) => {
    try {
        const { templateId, to } = req.body;

        if (!to) {
            return res.status(400).json({
                message: 'Recipient email is required',
            });
        }

        if (!templateId) {
            return res.status(400).json({
                message: 'Template ID is required',
            });
        }

        const template = await EmailTemplate.findByPk(templateId);

        if (!template) {
            return res.status(404).json({
                message: 'Email template not found',
            });
        }

        await sendEmail('template', {
            to,
            subject: template.subject,
            content: template.content,
        });

        return res.status(200).json({
            message: `Email sent successfully to ${to} using template "${template.name}"`,
        });
    } catch (error) {
        next(error);
    }
});

// ===== EMAIL TEMPLATE CRUD =====

emailController.get('/templates', async (req, res, next) => {
    try {
        const templates = await EmailTemplate.findAll();

        return res.status(200).json(templates);
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
