const statisticsController = require('express').Router();
const { Order, Review, sequelize } = require('../config/modelsConfig');
const { Op } = require('sequelize');
const analyticsService = require('../utils/analyticsService');
const getDateRange = require('../utils/getDateRange');

statisticsController.get('/stats', async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;
        const dateRange = getDateRange(period);

        const ordersData = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
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
                createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
            },
            raw: true,
        });

        const totalReviews = parseInt(reviewsData?.totalReviews || 0);
        const averageRating = parseFloat(reviewsData?.averageRating || 0);

        let uniqueVisitors = 0;
        let todayVisitors = 0;

        try {
            const allData = await analyticsService.getAllAnalyticsData(dateRange.startDateGA, dateRange.endDateGA);
            const realtimeData = allData.realtime;
            const visitorsData = allData.visitors;

            uniqueVisitors = visitorsData.totalUsers || 0;
            todayVisitors = realtimeData.activeUsers || 0;
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
        const dateRange = getDateRange(period);

        let totalVisitors = 0;
        let uniqueVisitors = 0;
        let todayVisitors = 0;
        let averageSessionTime = '0:00';
        let bounceRate = 0;
        let pageViews = 0;
        let newVisitors = 0;
        let returningVisitors = 0;
        let dailyData = [];
        let hourlyData = [];
        let deviceData = [];
        let trafficSources = [];
        let topPages = [];
        let countries = [];

        try {
            const allData = await analyticsService.getAllAnalyticsData(dateRange.startDateGA, dateRange.endDateGA);
            const realtimeData = allData.realtime;
            const visitorsData = allData.visitors;
            const dailyDataRaw = allData.daily;
            const hourlyDataRaw = allData.hourly;
            const deviceDataRaw = allData.device;
            const trafficDataRaw = allData.traffic;
            const topPagesDataRaw = allData.topPages;
            const countriesDataRaw = allData.geographic;

            // Use clean transformed data
            totalVisitors = visitorsData.sessions || 0;
            uniqueVisitors = visitorsData.totalUsers || 0;
            pageViews = visitorsData.screenPageViews || 0;
            todayVisitors = realtimeData.activeUsers || 0;
            bounceRate = visitorsData.bounceRate || 0;

            const sessionTimeSeconds = visitorsData.averageSessionDuration || 0;
            const minutes = Math.floor(sessionTimeSeconds / 60);
            const seconds = Math.floor(sessionTimeSeconds % 60);
            averageSessionTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            newVisitors = Math.floor(uniqueVisitors * 0.6);
            returningVisitors = uniqueVisitors - newVisitors;

            // Process daily data
            if (dailyDataRaw && dailyDataRaw.length > 0) {
                dailyData = dailyDataRaw.map((row) => {
                    const dateValue = row.date || '';
                    const day = dateValue.substring(6, 8);
                    const month = dateValue.substring(4, 6);
                    const formattedDate = `${day}.${month}`;

                    return {
                        date: formattedDate,
                        visitors: row.sessions || 0,
                        unique: row.totalUsers || 0,
                        pageViews: row.screenPageViews || 0,
                    };
                });
            }

            // Use the already formatted data from analytics service
            hourlyData = hourlyDataRaw || [];
            deviceData = deviceDataRaw || [];
            trafficSources = trafficDataRaw || [];
            countries = countriesDataRaw || [];

            // Process top pages
            if (topPagesDataRaw && topPagesDataRaw.length > 0) {
                const totalViews = topPagesDataRaw.reduce((sum, row) => sum + (row.pageViews || 0), 0);

                topPages = topPagesDataRaw.map((row) => {
                    const page = row.page || '';
                    const views = row.pageViews || 0;
                    const percentage = totalViews > 0 ? Math.round((views / totalViews) * 100 * 10) / 10 : 0;

                    return {
                        page: page,
                        views: views,
                        percentage: percentage,
                    };
                });
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
            dailyData,
            hourlyData,
            deviceData,
            trafficSources,
            topPages,
            countries,
        };

        return res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
});

statisticsController.get('/reviews', async (req, res, next) => {
    try {
        const { period = '30d' } = req.query;
        const dateRange = getDateRange(period);

        // Get all reviews - no need for attributes since we want all fields
        const reviews = await Review.findAll({
            where: {
                createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
            },
            order: [['createdAt', 'DESC']],
        });

        // Get review statistics
        const reviewStats = await Review.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: {
                createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
            },
            group: ['status'],
            raw: true,
        });

        // Get rating distribution
        const ratingDistribution = await Review.findAll({
            attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: {
                createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
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
                createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
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
        const dateRange = getDateRange(period);

        switch (reportType) {
            case 'overview':
                return await generateOverviewReport(req, res, dateRange);
            case 'sales':
                return await generateSalesReport(req, res, dateRange);
            case 'traffic':
                return await generateTrafficReport(req, res, dateRange);
            case 'reviews':
                return await generateReviewsReport(req, res, dateRange);
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }
    } catch (err) {
        next(err);
    }
});

async function generateOverviewReport(req, res, dateRange) {
    const ordersData = await Order.findOne({
        where: {
            createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
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
            createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
        },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
            [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        ],
        raw: true,
    });

    let uniqueVisitors = 0;
    try {
        const allData = await analyticsService.getAllAnalyticsData(dateRange.startDateGA, dateRange.endDateGA);
        uniqueVisitors = allData.visitors.totalUsers || 0;
    } catch (err) {
        console.warn('GA data unavailable:', err.message);
    }

    const totalOrders = parseInt(ordersData?.totalOrders || 0);
    const totalRevenue = parseFloat(ordersData?.totalRevenue || 0);
    const totalReviews = parseInt(reviewsData?.totalReviews || 0);
    const averageRating = parseFloat(reviewsData?.averageRating || 0);
    const conversionRate = uniqueVisitors > 0 ? (totalOrders / uniqueVisitors) * 100 : 0;

    const report = {
        overview: {
            totalOrders,
            totalRevenue,
            totalVisitors: parseInt(uniqueVisitors),
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            conversionRate: Math.round(conversionRate * 100) / 100,
        },
    };

    return res.status(200).json(report);
}

async function generateSalesReport(req, res, dateRange) {
    const monthlyData = await Order.findAll({
        where: {
            createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
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

async function generateTrafficReport(req, res, dateRange) {
    let trafficData = [];
    let topPages = [];

    try {
        const allData = await analyticsService.getAllAnalyticsData(dateRange.startDateGA, dateRange.endDateGA);
        const dailyDataRaw = allData.daily;
        const topPagesDataRaw = allData.topPages;

        // Process daily data
        if (dailyDataRaw && dailyDataRaw.length > 0) {
            trafficData = dailyDataRaw.map((row) => {
                const dateValue = row.date || '';
                const day = dateValue.substring(6, 8);
                const month = dateValue.substring(4, 6);
                const formattedDate = `${day}.${month}`;

                return {
                    date: formattedDate,
                    visitors: row.sessions || 0,
                    pageviews: row.screenPageViews || 0,
                    sessions: row.sessions || 0,
                };
            });
        }

        // Process top pages
        if (topPagesDataRaw && topPagesDataRaw.length > 0) {
            const totalViews = topPagesDataRaw.reduce((sum, row) => sum + (row.pageViews || 0), 0);

            topPages = topPagesDataRaw.map((row) => {
                const views = row.pageViews || 0;
                const percentage = totalViews > 0 ? Math.round((views / totalViews) * 100 * 10) / 10 : 0;

                return {
                    page: row.page || '',
                    views: views,
                    percentage: percentage,
                };
            });
        }
    } catch (err) {
        console.warn('GA data unavailable for traffic report:', err.message);
    }

    return res.status(200).json({ trafficData, topPages });
}

async function generateReviewsReport(req, res, dateRange) {
    const ratingDistribution = await Review.findAll({
        where: {
            createdAt: { [Op.between]: [dateRange.startDate, dateRange.endDate] },
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

// TESTING - WILL BE REMOVED !!!
statisticsController.get('/cache-status', async (req, res, next) => {
    try {
        const cacheStatus = analyticsService.getCacheStatus();
        return res.status(200).json(cacheStatus);
    } catch (err) {
        next(err);
    }
});

statisticsController.get('/cache-data', async (req, res, next) => {
    try {
        const cacheData = analyticsService.getCacheData();
        return res.status(200).json(cacheData);
    } catch (err) {
        next(err);
    }
});

module.exports = statisticsController;
