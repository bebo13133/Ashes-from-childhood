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

        let uniqueVisitorsForPeriod = 0;
        let visitorsForPeriod = 0;

        try {
            const realtimeData = await analyticsService.getRealtimeData();
            const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);

            // Historical: unique users for the period (metricValues[0] = totalUsers)
            uniqueVisitorsForPeriod = visitorsData.rows && visitorsData.rows.length > 0 ? parseInt(visitorsData.rows[0]?.metricValues?.[0]?.value || 0) : 0;
            // Historical: total sessions for the period (metricValues[1] = sessions)
            visitorsForPeriod = visitorsData.rows && visitorsData.rows.length > 0 ? parseInt(visitorsData.rows[0]?.metricValues?.[1]?.value || 0) : 0;

            // If no historical data, use realtime data as fallback
            if (uniqueVisitorsForPeriod === 0 && visitorsForPeriod === 0) {
                console.log('No historical data available, using realtime data as fallback');
                uniqueVisitorsForPeriod = realtimeData.rows && realtimeData.rows.length > 0 ? parseInt(realtimeData.rows[0]?.metricValues?.[0]?.value || 0) : 0;
                visitorsForPeriod = realtimeData.rows && realtimeData.rows.length > 0 ? parseInt(realtimeData.rows[0]?.metricValues?.[1]?.value || 0) : 0;
            }

            console.log('Final values - Unique visitors:', uniqueVisitorsForPeriod, 'Total sessions:', visitorsForPeriod);
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
            uniqueVisitors: uniqueVisitorsForPeriod,
            todayVisitors: visitorsForPeriod,
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

                totalVisitors = parseInt(metrics[1]?.value || 0); // sessions
                uniqueVisitors = parseInt(metrics[0]?.value || 0); // totalUsers
                pageViews = parseInt(metrics[2]?.value || 0); // screenPageViews

                // Get bounce rate (metric index 3)
                const bounceRateValue = parseFloat(metrics[3]?.value || 0);
                bounceRate = Math.round(bounceRateValue * 100) / 100;

                // Get average session duration (metric index 4)
                const sessionTimeSeconds = parseFloat(metrics[4]?.value || 0);
                const minutes = Math.floor(sessionTimeSeconds / 60);
                const seconds = Math.floor(sessionTimeSeconds % 60);
                averageSessionTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                // Calculate new vs returning visitors (approximate)
                newVisitors = Math.floor(uniqueVisitors * 0.6);
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

statisticsController.get('/reviews', async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;
        const dateRange = analyticsService.getDateRange(period);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        // Get all reviews with full details
        const reviews = await Review.findAll({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
            },
            attributes: ['id', 'name', 'rating', 'comment', 'status', 'createdAt', 'updatedAt', 'isAnonymous', 'helpful'],
            order: [['createdAt', 'DESC']],
        });

        // Get review statistics
        const reviewStats = await Review.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
            },
            group: ['status'],
            raw: true,
        });

        // Get rating distribution
        const ratingDistribution = await Review.findAll({
            attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
                rating: { [Op.ne]: null },
            },
            group: ['rating'],
            order: [['rating', 'DESC']],
            raw: true,
        });

        // Get monthly review trends
        const monthlyReviews = await Review.findAll({
            attributes: [
                [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM'), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'reviews'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
            ],
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
            },
            group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM')],
            order: [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM'), 'ASC']],
            raw: true,
        });

        // Process statistics
        let totalReviews = 0;
        let pendingReviews = 0;
        let approvedReviews = 0;
        let rejectedReviews = 0;
        let hiddenReviews = 0;

        reviewStats.forEach((stat) => {
            const count = parseInt(stat.count);
            totalReviews += count;

            switch (stat.status) {
                case 'pending':
                    pendingReviews = count;
                    break;
                case 'approved':
                    approvedReviews = count;
                    break;
                case 'rejected':
                    rejectedReviews = count;
                    break;
                case 'hidden':
                    hiddenReviews = count;
                    break;
            }
        });

        // Process rating distribution
        const ratingDist = ratingDistribution.map((dist) => {
            const count = parseInt(dist.count);
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return {
                rating: parseInt(dist.rating),
                count,
                percentage: Math.round(percentage * 10) / 10,
            };
        });

        // Process monthly data
        const monthlyData = monthlyReviews.map((month) => {
            const monthNames = {
                '01': 'Яну',
                '02': 'Фев',
                '03': 'Мар',
                '04': 'Апр',
                '05': 'Май',
                '06': 'Юни',
                '07': 'Юли',
                '08': 'Авг',
                '09': 'Сеп',
                10: 'Окт',
                11: 'Ное',
                12: 'Дек',
            };

            const monthKey = month.month.split('-')[1];
            const monthName = monthNames[monthKey] || monthKey;

            return {
                month: monthName,
                reviews: parseInt(month.reviews),
                avgRating: Math.round(parseFloat(month.avgRating || 0) * 10) / 10,
            };
        });

        const response = {
            reviews: reviews.map((review) => ({
                id: review.id,
                name: review.name,
                rating: review.rating,
                comment: review.comment,
                status: review.status,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt,
                isAnonymous: review.isAnonymous,
                helpful: review.helpful || 0,
            })),
            stats: {
                totalReviews,
                pendingReviews,
                approvedReviews,
                rejectedReviews,
                hiddenReviews,
            },
            ratingDistribution: ratingDist,
            monthlyReviews: monthlyData,
        };

        return res.status(200).json(response);
    } catch (err) {
        next(err);
    }
});

statisticsController.get('/reports/:reportType', async (req, res, next) => {
    try {
        const { reportType } = req.params;
        const { period = '30d' } = req.query;
        const dateRange = analyticsService.getDateRange(period);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        switch (reportType) {
            case 'overview':
                return await generateOverviewReport(req, res, startDate, endDate);
            case 'sales':
                return await generateSalesReport(req, res, startDate, endDate);
            case 'traffic':
                return await generateTrafficReport(req, res, startDate, endDate);
            case 'reviews':
                return await generateReviewsReport(req, res, startDate, endDate);
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }
    } catch (err) {
        next(err);
    }
});

async function generateOverviewReport(req, res, startDate, endDate) {
    // Get orders data
    const ordersData = await Order.findAll({
        where: { createdAt: { [Op.between]: [startDate, endDate] } },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.literal('quantity * price_at_order')), 'totalRevenue'],
        ],
        raw: true,
    });

    // Get reviews data
    const reviewsData = await Review.findOne({
        where: {
            status: 'approved',
            createdAt: { [Op.between]: [startDate, endDate] },
        },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        ],
        raw: true,
    });

    // Get visitors data
    let totalVisitors = 0;
    try {
        const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);
        totalVisitors = visitorsData.rows?.[0]?.metricValues?.[0]?.value || 0;
    } catch (err) {
        console.warn('GA data unavailable:', err.message);
    }

    const totalOrders = parseInt(ordersData[0]?.totalOrders || 0);
    const totalRevenue = parseFloat(ordersData[0]?.totalRevenue || 0);
    const totalReviews = parseInt(reviewsData?.totalReviews || 0);
    const averageRating = parseFloat(reviewsData?.averageRating || 0);
    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;

    const report = {
        totalOrders,
        totalRevenue,
        totalVisitors: parseInt(totalVisitors),
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        conversionRate: Math.round(conversionRate * 100) / 100,
    };

    return res.status(200).json(report);
}

async function generateSalesReport(req, res, startDate, endDate) {
    // Get monthly sales data
    const monthlyData = await Order.findAll({
        where: { createdAt: { [Op.between]: [startDate, endDate] } },
        attributes: [
            [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
            [sequelize.fn('SUM', sequelize.literal('quantity * price_at_order')), 'revenue'],
        ],
        group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM')],
        order: [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM'), 'ASC']],
        raw: true,
    });

    const monthNames = {
        '01': 'Яну',
        '02': 'Фев',
        '03': 'Мар',
        '04': 'Апр',
        '05': 'Май',
        '06': 'Юни',
        '07': 'Юли',
        '08': 'Авг',
        '09': 'Сеп',
        10: 'Окт',
        11: 'Ное',
        12: 'Дек',
    };

    const salesData = monthlyData.map((month) => {
        const monthKey = month.month.split('-')[1];
        const monthName = monthNames[monthKey] || monthKey;

        return {
            month: monthName,
            orders: parseInt(month.orders),
            revenue: parseFloat(month.revenue || 0),
            target: Math.round(parseFloat(month.revenue || 0) * 1.1), // 10% above actual
        };
    });

    return res.status(200).json({ salesData });
}

async function generateTrafficReport(req, res, startDate, endDate) {
    // This would need daily analytics data - for now return mock structure
    const trafficData = [
        { date: '01.11', visitors: 234, pageviews: 567, sessions: 198 },
        { date: '02.11', visitors: 189, pageviews: 445, sessions: 156 },
        // ... more data would come from analytics
    ];

    return res.status(200).json({ trafficData });
}

async function generateReviewsReport(req, res, startDate, endDate) {
    // Get rating distribution
    const ratingDistribution = await Review.findAll({
        where: {
            createdAt: { [Op.between]: [startDate, endDate] },
            rating: { [Op.ne]: null },
        },
        attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['rating'],
        order: [['rating', 'DESC']],
        raw: true,
    });

    const totalReviews = ratingDistribution.reduce((sum, dist) => sum + parseInt(dist.count), 0);

    const ratingDist = ratingDistribution.map((dist) => {
        const count = parseInt(dist.count);
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return {
            rating: parseInt(dist.rating),
            count,
            percentage: Math.round(percentage * 10) / 10,
        };
    });

    // Mock top pages data (would come from analytics)
    const topPages = [
        { page: '/', views: 5432, percentage: 31.2 },
        { page: '/order', views: 3456, percentage: 19.8 },
        { page: '/reviews', views: 2567, percentage: 14.7 },
    ];

    return res.status(200).json({ ratingDistribution: ratingDist, topPages });
}

module.exports = statisticsController;
