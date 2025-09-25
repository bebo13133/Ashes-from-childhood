const { google } = require('googleapis');
const analyticsConfig = require('../config/analyticsConfig');

class AnalyticsService {
    constructor() {
        this.analytics = null;
        this.propertyId = analyticsConfig.googleAnalytics.propertyId;

        this.cache = {
            data: null,
            timestamp: null,
            isUpdating: false,
        };

        this.cacheDuration = parseInt(analyticsConfig.googleAnalytics.duration) || 3600;
        this.lastCacheLog = null; // Track last cache log to avoid spam
    }

    isCacheValid() {
        if (!this.cache.data || !this.cache.timestamp) {
            return false;
        }

        const now = Date.now();
        const cacheAge = now - this.cache.timestamp;

        return cacheAge < this.cacheDuration;
    }

    getCacheData() {
        return this.cache.data;
    }

    setCacheData(data) {
        this.cache.data = data;
        this.cache.timestamp = Date.now();

        // Only log cache update once per cache cycle
        const cacheStart = new Date(this.cache.timestamp);
        const cacheEnd = new Date(this.cache.timestamp + this.cacheDuration);

        console.log(
            `📊 Cached GA data from ${cacheStart.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })} till ${cacheEnd.toLocaleTimeString(
                'bg-BG',
                { hour: '2-digit', minute: '2-digit' }
            )}`
        );
    }

    async getAllAnalyticsData(startDate, endDate) {
        if (this.isCacheValid()) {
            // Only log cache usage once per minute to reduce spam
            const now = Date.now();
            if (!this.lastCacheLog || now - this.lastCacheLog > 60000) {
                console.log('📊 Using cached GA data');
                this.lastCacheLog = now;
            }
            return this.getCacheData();
        }

        if (this.cache.isUpdating) {
            // Only log update in progress once per minute
            const now = Date.now();
            if (!this.lastCacheLog || now - this.lastCacheLog > 60000) {
                console.log('📊 Analytics update in progress, returning cached data');
                this.lastCacheLog = now;
            }
            // Return cached data if available, otherwise return empty structure
            return this.getCacheData() || this.getEmptyDataStructure();
        }

        this.cache.isUpdating = true;
        console.log('📊 Fetching fresh analytics data from GA...');

        try {
            const [realtime, visitors, daily, hourly, device, traffic, geographic, topPages] = await Promise.all([
                this.getRealtimeData(),
                this.getVisitorsData(startDate, endDate),
                this.getDailyVisitorsData(startDate, endDate),
                this.getHourlyVisitorsData(startDate, endDate),
                this.getDeviceData(startDate, endDate),
                this.getTrafficSourcesData(startDate, endDate),
                this.getGeographicData(startDate, endDate),
                this.getTopPagesData(startDate, endDate),
            ]);

            const cleanData = {
                realtime: this.transformRealtimeData(realtime),
                visitors: this.transformVisitorsData(visitors),
                daily: this.transformDailyData(daily),
                hourly: this.transformHourlyData(hourly),
                device: this.transformDeviceData(device),
                traffic: this.transformTrafficData(traffic),
                geographic: this.transformGeographicData(geographic),
                topPages: this.transformTopPagesData(topPages),
                lastUpdated: new Date().toISOString(),
            };

            this.setCacheData(cleanData);
            console.log('✅ Analytics data fetched and cached successfully');
            return cleanData;
        } catch (err) {
            console.error('❌ Error fetching analytics data:', err);

            if (this.cache.data) {
                console.log('📊 GA failed, returning cached data (may be expired)');
                return this.getCacheData();
            }

            console.log('📊 No cached data available, returning empty structure');
            return this.getEmptyDataStructure();
        } finally {
            this.cache.isUpdating = false;
        }
    }

    transformRealtimeData(gaResponse) {
        if (!gaResponse.rows || gaResponse.rows.length === 0) {
            return { activeUsers: 0, screenPageViews: 0 };
        }

        const row = gaResponse.rows[0];
        const metrics = row.metricValues || [];

        return {
            activeUsers: parseInt(metrics[0]?.value || 0),
            screenPageViews: parseInt(metrics[1]?.value || 0),
        };
    }

    transformVisitorsData(gaResponse) {
        if (!gaResponse.rows || gaResponse.rows.length === 0) {
            return { totalUsers: 0, sessions: 0, screenPageViews: 0, bounceRate: 0, averageSessionDuration: 0 };
        }

        const row = gaResponse.rows[0];
        const metrics = row.metricValues || [];

        return {
            totalUsers: parseInt(metrics[0]?.value || 0),
            sessions: parseInt(metrics[1]?.value || 0),
            screenPageViews: parseInt(metrics[2]?.value || 0),
            bounceRate: parseFloat(metrics[3]?.value || 0),
            averageSessionDuration: parseFloat(metrics[4]?.value || 0),
        };
    }

    transformDailyData(gaResponse) {
        if (!gaResponse.rows) {
            return [];
        }

        return gaResponse.rows.map((row) => {
            const dateValue = row.dimensionValues?.[0]?.value || '';
            const metrics = row.metricValues || [];

            return {
                date: dateValue,
                totalUsers: parseInt(metrics[0]?.value || 0),
                sessions: parseInt(metrics[1]?.value || 0),
                screenPageViews: parseInt(metrics[2]?.value || 0),
            };
        });
    }

    transformHourlyData(gaResponse) {
        if (!gaResponse.rows) {
            return [];
        }

        const hourlyMap = {};

        // Initialize all hours with 0
        for (let i = 0; i < 24; i++) {
            hourlyMap[i] = 0;
        }

        // Fill in actual data
        gaResponse.rows.forEach((row) => {
            const hour = parseInt(row.dimensionValues?.[0]?.value || 0);
            const sessions = parseInt(row.metricValues?.[0]?.value || 0);
            hourlyMap[hour] = sessions;
        });

        // Convert to array format expected by frontend
        return Object.keys(hourlyMap).map((hour) => ({
            hour: `${hour}:00`,
            visitors: hourlyMap[hour],
        }));
    }

    transformDeviceData(gaResponse) {
        if (!gaResponse.rows || gaResponse.rows.length === 0) {
            return [];
        }

        const totalSessions = gaResponse.rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || 0), 0);
        const colors = ['#667eea', '#764ba2', '#f093fb'];

        return gaResponse.rows.map((row, index) => {
            const device = row.dimensionValues?.[0]?.value || 'Unknown';
            const sessions = parseInt(row.metricValues?.[0]?.value || 0);
            const percentage = totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0;

            return {
                name: device === 'desktop' ? 'Desktop' : device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablet' : device,
                value: percentage,
                color: colors[index % colors.length],
            };
        });
    }

    transformTrafficData(gaResponse) {
        if (!gaResponse.rows || gaResponse.rows.length === 0) {
            return [];
        }

        const totalSessions = gaResponse.rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || 0), 0);

        return gaResponse.rows.map((row) => {
            const source = row.dimensionValues?.[0]?.value || 'Unknown';
            const sessions = parseInt(row.metricValues?.[0]?.value || 0);
            const percentage = totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0;

            return {
                source:
                    source === 'Organic Search'
                        ? 'Търсене'
                        : source === 'Direct'
                        ? 'Директен трафик'
                        : source === 'Social'
                        ? 'Социални мрежи'
                        : source === 'Referral'
                        ? 'Препратки'
                        : source === 'Paid Search'
                        ? 'Платена реклама'
                        : source === 'Email'
                        ? 'Имейл'
                        : source,
                visitors: sessions,
                percentage: percentage,
            };
        });
    }

    transformGeographicData(gaResponse) {
        if (!gaResponse.rows || gaResponse.rows.length === 0) {
            return [];
        }

        return gaResponse.rows.map((row) => {
            const country = row.dimensionValues?.[0]?.value || 'Unknown';
            const visitors = parseInt(row.metricValues?.[0]?.value || 0);

            return {
                country: country,
                visitors: visitors,
            };
        });
    }

    transformTopPagesData(gaResponse) {
        if (!gaResponse.rows) {
            return [];
        }

        return gaResponse.rows.map((row) => {
            const page = row.dimensionValues?.[0]?.value || 'Unknown';
            const pageViews = parseInt(row.metricValues?.[0]?.value || 0);

            return {
                page: page,
                pageViews: pageViews,
            };
        });
    }

    getEmptyDataStructure() {
        return {
            realtime: { activeUsers: 0, screenPageViews: 0 },
            visitors: { totalUsers: 0, sessions: 0, screenPageViews: 0, bounceRate: 0, averageSessionDuration: 0 },
            daily: [],
            hourly: [],
            device: [],
            traffic: [],
            geographic: [],
            topPages: [],
            lastUpdated: new Date().toISOString(),
        };
    }

    getCacheStatus() {
        return {
            hasData: !!this.cache.data,
            timestamp: this.cache.timestamp,
            isUpdating: this.cache.isUpdating,
            isValid: this.isCacheValid(),
            cacheDuration: this.cacheDuration,
            age: this.cache.timestamp ? Date.now() - this.cache.timestamp : null,
        };
    }

    clearCache() {
        this.cache = {
            data: null,
            timestamp: null,
            isUpdating: false,
        };

        console.log('📊 Analytics cache cleared');
    }

    async initialize() {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: analyticsConfig.googleAnalytics.credentials,
                scopes: analyticsConfig.googleAnalytics.scopes,
            });

            this.analytics = google.analyticsdata({
                version: 'v1beta',
                auth: auth,
            });

            console.log('✅ Google Analytics service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Google Analytics:', error);
            throw error;
        }
    }

    async getRealtimeData() {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runRealtimeReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getVisitorsData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [
                        { name: 'totalUsers' },
                        { name: 'sessions' },
                        { name: 'screenPageViews' },
                        { name: 'bounceRate' },
                        { name: 'averageSessionDuration' },
                    ],
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching visitors data:', error);
            throw error;
        }
    }

    async getDailyVisitorsData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' }],
                    dimensions: [{ name: 'date' }],
                    orderBys: [{ dimension: { dimensionName: 'date' } }],
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching daily visitors data:', error);
            throw error;
        }
    }

    async getHourlyVisitorsData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'sessions' }],
                    dimensions: [{ name: 'hour' }],
                    orderBys: [{ dimension: { dimensionName: 'hour' } }],
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching hourly visitors data:', error);
            throw error;
        }
    }

    async getDeviceData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'sessions' }],
                    dimensions: [{ name: 'deviceCategory' }],
                    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching device data:', error);
            throw error;
        }
    }

    async getTrafficSourcesData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'sessions' }],
                    dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
                    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching traffic sources data:', error);
            throw error;
        }
    }

    async getGeographicData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'sessions' }],
                    dimensions: [{ name: 'country' }],
                    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                    limit: 10,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching geographic data:', error);
            throw error;
        }
    }

    async getTopPagesData(startDate, endDate) {
        if (!this.analytics) {
            await this.initialize();
        }

        try {
            const response = await this.analytics.properties.runReport({
                property: `properties/${this.propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'screenPageViews' }],
                    dimensions: [{ name: 'pagePath' }],
                    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                    limit: 10,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching top pages data:', error);
            throw error;
        }
    }
}

module.exports = new AnalyticsService();
