const { google } = require('googleapis');
const analyticsConfig = require('../config/analyticsConfig');

class AnalyticsService {
    constructor() {
        this.analytics = null;
        this.propertyId = analyticsConfig.googleAnalytics.propertyId;
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

            console.log('Google Analytics service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Analytics:', error);
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

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    getDateRange(period) {
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '1d':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        return {
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate),
        };
    }

    // Helper method to format hourly data for frontend
    formatHourlyData(gaData) {
        if (!gaData.rows) return [];

        const hourlyMap = {};

        // Initialize all hours with 0
        for (let i = 0; i < 24; i++) {
            hourlyMap[i] = 0;
        }

        // Fill in actual data
        gaData.rows.forEach((row) => {
            const hour = parseInt(row.dimensionValues?.[0]?.value || 0);
            const visitors = parseInt(row.metricValues?.[0]?.value || 0);
            hourlyMap[hour] = visitors;
        });

        // Convert to array format expected by frontend
        return Object.keys(hourlyMap).map((hour) => ({
            hour: `${hour}:00`,
            visitors: hourlyMap[hour],
        }));
    }

    // Helper method to format device data for frontend
    formatDeviceData(gaData) {
        if (!gaData.rows || gaData.rows.length === 0) return [];

        const totalSessions = gaData.rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || 0), 0);

        const colors = ['#667eea', '#764ba2', '#f093fb'];

        return gaData.rows.map((row, index) => {
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

    // Helper method to format traffic sources for frontend
    formatTrafficSources(gaData) {
        if (!gaData.rows || gaData.rows.length === 0) return [];

        const totalSessions = gaData.rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || 0), 0);

        return gaData.rows.map((row) => {
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

    // Helper method to format geographic data for frontend
    formatGeographicData(gaData) {
        if (!gaData.rows || gaData.rows.length === 0) return [];

        const countryFlags = {
            Bulgaria: '🇧🇬',
            'United States': '🇺🇸',
            Germany: '🇩🇪',
            'United Kingdom': '🇬🇧',
            France: '🇫🇷',
            Italy: '🇮🇹',
            Spain: '🇪🇸',
            Netherlands: '🇳🇱',
            Poland: '🇵🇱',
            Romania: '🇷🇴',
            Greece: '🇬🇷',
            Turkey: '🇹🇷',
            Russia: '🇷🇺',
            Ukraine: '🇺🇦',
            Serbia: '🇷🇸',
            'North Macedonia': '🇲🇰',
            Croatia: '🇭🇷',
            Slovenia: '🇸🇮',
            Slovakia: '🇸🇰',
            'Czech Republic': '🇨🇿',
            Austria: '🇦🇹',
            Hungary: '🇭🇺',
            Canada: '🇨🇦',
            Australia: '🇦🇺',
            Brazil: '🇧🇷',
            Argentina: '🇦🇷',
            Mexico: '🇲🇽',
            India: '🇮🇳',
            China: '🇨🇳',
            Japan: '🇯🇵',
            'South Korea': '🇰🇷',
            Thailand: '🇹🇭',
            Singapore: '🇸🇬',
            Malaysia: '🇲🇾',
            Indonesia: '🇮🇩',
            Philippines: '🇵🇭',
            Vietnam: '🇻🇳',
        };

        return gaData.rows.map((row) => {
            const country = row.dimensionValues?.[0]?.value || 'Unknown';
            const visitors = parseInt(row.metricValues?.[0]?.value || 0);

            return {
                country: country,
                visitors: visitors,
                flag: countryFlags[country] || '🌍',
            };
        });
    }
}

module.exports = new AnalyticsService();
