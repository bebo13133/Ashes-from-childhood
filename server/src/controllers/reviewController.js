const reviewController = require('express').Router();
const { Review, Notification } = require('../config/modelsConfig');
const { sendEmail } = require('../utils/emailTemplates');
const { checkAndSetCookie } = require('../utils/cookieTracker');
const fs = require('fs');
const path = require('path');

reviewController.post('/create', async (req, res, next) => {
    try {
        if (!checkAndSetCookie(req, res, 'reviewSubmitted')) {
            return res.status(429).json({
                message: 'You have already submitted a review.',
                code: 'REVIEW_ALREADY_SUBMITTED',
            });
        }

        const { name, isAnonymous, rating, comment } = req.body;

        if (rating !== null && rating !== undefined) {
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                return res.status(400).json({
                    message: 'Rating must be an integer between 1 and 5',
                });
            }
        }

        if (!isAnonymous && (!name || name.trim().length === 0)) {
            return res.status(400).json({
                message: 'Name is required for non-anonymous reviews',
            });
        }

        if ((!comment || comment.trim().length === 0) && (rating === null || rating === undefined)) {
            return res.status(400).json({
                message: 'Either comment or rating must be provided',
            });
        }

        const review = await Review.create({
            name: isAnonymous ? null : name.trim(),
            isAnonymous: isAnonymous || false,
            rating: rating || null,
            comment: comment ? comment.trim() : null,
        });

        const reviewMessage = rating ? `Нов отзив с ${rating} звезди от ${review.displayName}` : `Нов отзив от ${review.displayName}`;

        await Notification.create({
            type: 'review',
            message: reviewMessage,
            related_id: review.id,
        });

        sendEmail('personalTemplate', {
            to: process.env.admin_email,
            subject: `Нов отзив #${review.id}`,
            content: reviewMessage,
        }).catch((error) => {
            console.error('Failed to send review notification email:', error);
        });

        return res.status(201).json({
            id: review.id,
            displayName: review.displayName,
            rating: review.rating,
            comment: review.comment,
            status: review.status,
            helpful: review.helpful,
            createdAt: review.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

reviewController.get('/all', async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const result = await getReviews(status, page, limit);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

reviewController.get('/approved', async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await getReviews('approved', page, limit);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

reviewController.put('/update-status/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected', 'hidden'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Must be: pending, approved, rejected, or hidden',
            });
        }

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                message: `Review with id ${id} does not exist`,
            });
        }

        await review.update({ status });

        return res.status(200).json({
            id: review.id,
            displayName: review.displayName,
            rating: review.rating,
            comment: review.comment,
            status: review.status,
            helpful: review.helpful,
            createdAt: review.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

reviewController.delete('/single/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                message: `Review with id ${id} does not exist`,
            });
        }

        const displayName = review.displayName;

        await review.destroy();

        return res.status(200).json({
            message: `Review with id ${id} by ${displayName} was deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
});

reviewController.put('/helpful/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!checkAndSetCookie(req, res, `reviewLiked_${id}`)) {
            return res.status(429).json({
                message: 'You have already liked this review.',
                code: 'LIKE_ALREADY_SUBMITTED',
            });
        }

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({
                message: `Review with id ${id} does not exist`,
            });
        }

        await review.incrementHelpful();
        await review.reload();

        return res.status(200).json({
            id: review.id,
            displayName: review.displayName,
            rating: review.rating,
            comment: review.comment,
            status: review.status,
            helpful: review.helpful,
            createdAt: review.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

reviewController.get('/images', async (req, res, next) => {
    try {
        const imagesDir = path.join(__dirname, '../uploads/reviewImages');
        const files = fs.readdirSync(imagesDir);

        const imageFiles = files
            .filter((file) => /^review-\d+\.jpeg$/i.test(file))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            })
            .map((file) => ({
                id: parseInt(file.match(/\d+/)[0]),
                imagePath: `/uploads/images/${file}`,
            }));

        return res.status(200).json({
            imageReviews: imageFiles,
        });
    } catch (error) {
        next(error);
    }
});

const getReviews = async (status = null, page = 1, limit = 10) => {
    const whereClause = {};
    if (status) {
        whereClause.status = status;
    }

    const reviews = await Review.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const totalCount = await Review.count({ where: whereClause });

    return {
        reviews: reviews.map((review) => ({
            id: review.id,
            displayName: review.displayName,
            rating: review.rating,
            comment: review.comment,
            status: review.status,
            helpful: review.helpful,
            createdAt: review.createdAt,
        })),
        pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
        },
    };
};

module.exports = reviewController;
