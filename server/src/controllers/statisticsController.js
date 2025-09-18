const statisticsController = require('express').Router();
const { Order, Review, sequelize } = require('../config/modelsConfig');
const { Op } = require('sequelize');
const analyticsService = require('../utils/analyticsService');

statisticsController.get('/stats', async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;

        const dateRange = analyticsService.getDateRange(period);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        const ordersData = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
            },

            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.literal('quantity * price_at_order')), 'totalRevenue'],
            ],
            group: ['status'],
            raw: true,
        });

        let totalOrders = 0;
        let pendingOrders = 0;
        let completedOrders = 0;
        let cancelledOrders = 0;
        let totalRevenue = 0;

        ordersData.forEach((order) => {
            const count = parseInt(order.count);
            const revenue = parseFloat(order.totalRevenue || 0);

            totalOrders += count;

            switch (order.status) {
                case 'pending':
                    pendingOrders = count;
                    break;
                case 'completed':
                    completedOrders = count;
                    totalRevenue = revenue;
                    break;
                case 'cancelled':
                    cancelledOrders = count;
                    break;
            }
        });

        const reviewsData = await Review.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
            ],
            where: {
                status: 'approved',
                rating: {
                    [Op.ne]: null,
                },
            },
            raw: true,
        });

        const totalReviews = parseInt(reviewsData?.totalReviews || 0);
        const averageRating = parseFloat(reviewsData?.averageRating || 0);

        let uniqueVisitors = 0;
        let todayVisitors = 0;

        try {
            const realtimeData = await analyticsService.getRealtimeData();
            todayVisitors = parseInt(realtimeData.rows?.[0]?.metricValues?.[1]?.value || 0);

            const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);
            uniqueVisitors = parseInt(visitorsData.rows?.[0]?.metricValues?.[1]?.value || 0);
        } catch (err) {
            console.warn(err.message);
        }

        const stats = {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            uniqueVisitors,
            todayVisitors,
        };

        return res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
});

statisticsController.get('/visitors', async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;

        const dateRange = analyticsService.getDateRange(period);

        let totalVisitors = 0;
        let uniqueVisitors = 0;
        let todayVisitors = 0;
        let averageSessionTime = '0:00';
        let bounceRate = 0;
        let pageViews = 0;
        let newVisitors = 0;
        let returningVisitors = 0;

        try {
            // Get realtime data for today's visitors
            const realtimeData = await analyticsService.getRealtimeData();
            todayVisitors = parseInt(realtimeData.rows?.[0]?.metricValues?.[0]?.value || 0);

            // Get historical data for the period
            const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);

            if (visitorsData.rows && visitorsData.rows.length > 0) {
                const row = visitorsData.rows[0];
                const metrics = row.metricValues || [];

                totalVisitors = parseInt(metrics[0]?.value || 0);
                uniqueVisitors = parseInt(metrics[1]?.value || 0);
                pageViews = parseInt(metrics[2]?.value || 0);

                // Calculate bounce rate (if available)
                const bounceRateValue = parseFloat(metrics[3]?.value || 0);
                bounceRate = Math.round(bounceRateValue * 100) / 100;

                // Calculate session time (if available)
                const sessionTimeSeconds = parseFloat(metrics[4]?.value || 0);
                const minutes = Math.floor(sessionTimeSeconds / 60);
                const seconds = Math.floor(sessionTimeSeconds % 60);
                averageSessionTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                // Calculate new vs returning visitors (approximate)
                newVisitors = Math.floor(uniqueVisitors * 0.6); // ~60% new visitors
                returningVisitors = uniqueVisitors - newVisitors;
            }
        } catch (err) {
            console.warn('GA data unavailable:', err.message);
        }

        const stats = {
            totalVisitors,
            uniqueVisitors,
            todayVisitors,
            averageSessionTime,
            bounceRate,
            pageViews,
            newVisitors,
            returningVisitors,
        };

        return res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
});

module.exports = statisticsController;
