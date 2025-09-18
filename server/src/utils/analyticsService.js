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
                    dimensions: [{ name: 'country' }, { name: 'city' }],
                },
            });

            return response.data;
        } catch (error) {
            // console.error('Error fetching realtime data:', error);
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
                    dateRanges: [
                        {
                            startDate: startDate,
                            endDate: endDate,
                        },
                    ],
                    metrics: [{ name: 'totalUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
                    // Remove dimensions to get overall totals
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching visitors data:', error);
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
}

module.exports = new AnalyticsService();
