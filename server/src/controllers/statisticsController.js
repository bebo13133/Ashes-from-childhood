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
                    totalRevenue += revenue;
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
                rating: { [Op.ne]: null },
            },
            raw: true,
        });

        const totalReviews = parseInt(reviewsData?.totalReviews || 0);
        const averageRating = parseFloat(reviewsData?.averageRating || 0);

        let uniqueVisitors = 0;
        let todayVisitors = 0;

        try {
            const realtimeData = await analyticsService.getRealtimeData();
            const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);

            uniqueVisitors = visitorsData.rows && visitorsData.rows.length > 0 ? parseInt(visitorsData.rows[0]?.metricValues?.[0]?.value || 0) : 0;
            todayVisitors = visitorsData.rows && visitorsData.rows.length > 0 ? parseInt(visitorsData.rows[0]?.metricValues?.[1]?.value || 0) : 0;

            if (uniqueVisitors === 0 && todayVisitors === 0) {
                uniqueVisitors = realtimeData.rows && realtimeData.rows.length > 0 ? parseInt(realtimeData.rows[0]?.metricValues?.[0]?.value || 0) : 0;
                todayVisitors = realtimeData.rows && realtimeData.rows.length > 0 ? parseInt(realtimeData.rows[0]?.metricValues?.[1]?.value || 0) : 0;
            }
        } catch (err) {
            console.warn('GA data unavailable:', err.message);
        }

        const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0;

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
            conversionRate: Math.round(conversionRate * 100) / 100,
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
            const realtimeData = await analyticsService.getRealtimeData();
            todayVisitors = parseInt(realtimeData.rows?.[0]?.metricValues?.[0]?.value || 0);

            const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);

            if (visitorsData.rows && visitorsData.rows.length > 0) {
                const row = visitorsData.rows[0];
                const metrics = row.metricValues || [];

                totalVisitors = parseInt(metrics[1]?.value || 0);
                uniqueVisitors = parseInt(metrics[0]?.value || 0);
                pageViews = parseInt(metrics[2]?.value || 0);

                const bounceRateValue = parseFloat(metrics[3]?.value || 0);
                bounceRate = Math.round(bounceRateValue * 100) / 100;

                const sessionTimeSeconds = parseFloat(metrics[4]?.value || 0);
                const minutes = Math.floor(sessionTimeSeconds / 60);
                const seconds = Math.floor(sessionTimeSeconds % 60);
                averageSessionTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

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

        // Get all reviews - no need for attributes since we want all fields
        const reviews = await Review.findAll({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] },
            },
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
                return await generateOverviewReport(req, res, startDate, endDate, dateRange);
            case 'sales':
                return await generateSalesReport(req, res, startDate, endDate);
            case 'traffic':
                return await generateTrafficReport(req, res, startDate, endDate, dateRange);
            case 'reviews':
                return await generateReviewsReport(req, res, startDate, endDate);
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }
    } catch (err) {
        next(err);
    }
});

async function generateOverviewReport(req, res, startDate, endDate, dateRange) {
    const ordersData = await Order.findOne({
        where: {
            createdAt: { [Op.between]: [startDate, endDate] },
            status: 'completed',
        },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.literal('quantity * price_at_order')), 'totalRevenue'],
        ],
        raw: true,
    });

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

    let totalVisitors = 0;
    try {
        const visitorsData = await analyticsService.getVisitorsData(dateRange.startDate, dateRange.endDate);
        totalVisitors = visitorsData.rows?.[0]?.metricValues?.[0]?.value || 0;
    } catch (err) {
        console.warn('GA data unavailable:', err.message);
    }

    const totalOrders = parseInt(ordersData?.totalOrders || 0);
    const totalRevenue = parseFloat(ordersData?.totalRevenue || 0);
    const totalReviews = parseInt(reviewsData?.totalReviews || 0);
    const averageRating = parseFloat(reviewsData?.averageRating || 0);
    const conversionRate = totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0;

    const report = {
        overview: {
            totalOrders,
            totalRevenue,
            totalVisitors: parseInt(totalVisitors),
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            conversionRate: Math.round(conversionRate * 100) / 100,
        },
    };

    return res.status(200).json(report);
}

async function generateSalesReport(req, res, startDate, endDate) {
    const monthlyData = await Order.findAll({
        where: {
            createdAt: { [Op.between]: [startDate, endDate] },
            status: 'completed',
        },
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
            target: Math.round(parseFloat(month.revenue || 0) * 1.1),
        };
    });

    return res.status(200).json({ salesData });
}

async function generateTrafficReport(req, res, startDate, endDate, dateRange) {
    let trafficData = [];
    let topPages = [];

    try {
        const dailyData = await analyticsService.getDailyVisitorsData(dateRange.startDate, dateRange.endDate);
        const topPagesData = await analyticsService.getTopPagesData(dateRange.startDate, dateRange.endDate);

        trafficData =
            dailyData.rows?.map((row) => {
                const dateValue = row.dimensionValues?.[0]?.value || '';
                const day = dateValue.substring(6, 8);
                const month = dateValue.substring(4, 6);
                const formattedDate = `${day}.${month}`;

                return {
                    date: formattedDate,
                    visitors: parseInt(row.metricValues?.[1]?.value || 0),
                    pageviews: parseInt(row.metricValues?.[2]?.value || 0),
                    sessions: parseInt(row.metricValues?.[1]?.value || 0),
                };
            }) || [];

        const totalViews = topPagesData.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || 0), 0) || 0;

        topPages =
            topPagesData.rows?.map((row) => {
                const views = parseInt(row.metricValues?.[0]?.value || 0);
                const percentage = totalViews > 0 ? Math.round((views / totalViews) * 100 * 10) / 10 : 0;

                return {
                    page: row.dimensionValues?.[0]?.value || '',
                    views: views,
                    percentage: percentage,
                };
            }) || [];
    } catch (err) {
        console.warn('GA data unavailable for traffic report:', err.message);
    }

    return res.status(200).json({ trafficData, topPages });
}

async function generateReviewsReport(req, res, startDate, endDate) {
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

    const ratingMap = {};
    ratingDistribution.forEach((dist) => {
        ratingMap[parseInt(dist.rating)] = parseInt(dist.count);
    });

    const reviewsData = [];
    for (let rating = 5; rating >= 1; rating--) {
        const count = ratingMap[rating] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        reviewsData.push({
            rating: rating,
            count: count,
            percentage: Math.round(percentage * 10) / 10,
        });
    }

    return res.status(200).json({ reviewsData });
}

module.exports = statisticsController;
