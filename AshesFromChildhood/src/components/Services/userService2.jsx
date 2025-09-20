import { requestFactory } from './requester';
const apiUrl = import.meta.env.VITE_API_URL;

export const userServiceFactory2 = (token) => {
    const requester = requestFactory(token);

    return {
        // ===== АВТЕНТИКАЦИЯ (/auth) =====
        // Всички endpoints за вход, изход, смяна на парола и възстановяване
        login: (data) => {
            return requester.post(`${apiUrl}/auth/login`, data);
        },

        logout: () => {
            return requester.post(`${apiUrl}/auth/logout`);
        },

        forgotPassword: (data) => {
            return requester.post(`${apiUrl}/auth/forgot-password`, data);
        },

        resetPassword: (data) => {
            return requester.post(`${apiUrl}/auth/reset-password`, data);
        },

        changePassword: (passwordData) => {
            return requester.put(`${apiUrl}/auth/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
        },

        // ===== УПРАВЛЕНИЕ НА КНИГИ (/books) =====
        // Endpoints за получаване и обновяване на цената на книгата
        getBookPrice: () => {
            return requester.get(`${apiUrl}/books/book-price`);
        },

        updateBookPrice: (price) => {
            return requester.put(`${apiUrl}/books/book-price`, { price });
        },

        // ===== УПРАВЛЕНИЕ НА ПОРЪЧКИ (/orders) =====
        // Всички endpoints за създаване, преглед, обновяване и изтриване на поръчки
        createOrder: (orderData) => {
            return requester.post(`${apiUrl}/orders/create`, orderData);
        },

        getAllOrders: (filters = {}) => {
            const queryParams = new URLSearchParams();

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const queryString = queryParams.toString();
            return requester.get(`${apiUrl}/orders/all${queryString ? `?${queryString}` : ''}`);
        },

        getOrderById: (orderId) => {
            return requester.get(`${apiUrl}/orders/single/${orderId}`);
        },

        updateOrderStatus: (orderId, status) => {
            return requester.put(`${apiUrl}/orders/update-status/${orderId}`, { status });
        },

        deleteOrder: (orderId) => {
            return requester.delete(`${apiUrl}/orders/single/${orderId}`);
        },

        // ===== УПРАВЛЕНИЕ НА ОТЗИВИ (/reviews) =====
        // Всички endpoints за създаване, преглед, обновяване и изтриване на отзиви
        createReview: (reviewData) => {
            return requester.post(`${apiUrl}/reviews/create`, reviewData);
        },

        getAllReviews: (filters = {}) => {
            const queryParams = new URLSearchParams();

            if (filters.status) queryParams.append('status', filters.status);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const queryString = queryParams.toString();
            return requester.get(`${apiUrl}/reviews/all${queryString ? `?${queryString}` : ''}`);
        },

        getApprovedReviews: (filters = {}) => {
            const queryParams = new URLSearchParams();

            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const queryString = queryParams.toString();
            return requester.get(`${apiUrl}/reviews/approved${queryString ? `?${queryString}` : ''}`);
        },

        updateReviewStatus: (reviewId, status) => {
            return requester.put(`${apiUrl}/reviews/update-status/${reviewId}`, { status });
        },

        markReviewAsHelpful: (reviewId) => {
            return requester.put(`${apiUrl}/reviews/helpful/${reviewId}`);
        },

        deleteReview: (reviewId) => {
            return requester.delete(`${apiUrl}/reviews/single/${reviewId}`);
        },

        // ===== УПРАВЛЕНИЕ НА ИМЕЙЛИ (/emails) =====
        // Endpoints за изпращане на имейли и управление на шаблони
        sendEmail: (emailData) => {
            return requester.post(`${apiUrl}/emails/send`, emailData);
        },

        // НЕ Е ИМПЛЕМЕНТИРАНО - Изпращане на масови имейли
        // sendBulkEmail: (emailData) => {
        //   return requester.post(`${apiUrl}/emails/bulk-send`, emailData);
        // },

        getEmailTemplates: () => {
            return requester.get(`${apiUrl}/emails/templates`);
        },

        getEmailTemplateById: (templateId) => {
            return requester.get(`${apiUrl}/emails/templates/single/${templateId}`);
        },

        createEmailTemplate: (templateData) => {
            return requester.post(`${apiUrl}/emails/templates/create`, templateData);
        },

        updateEmailTemplate: (templateId, templateData) => {
            return requester.put(`${apiUrl}/emails/templates/update/${templateId}`, templateData);
        },

        deleteEmailTemplate: (templateId) => {
            return requester.delete(`${apiUrl}/emails/templates/single/${templateId}`);
        },

        // ===== УПРАВЛЕНИЕ НА ИЗВЕСТЯВАНИЯ (/notifications) =====
        // Endpoints за преглед и управление на известията
        getAllNotifications: () => {
            return requester.get(`${apiUrl}/notifications/all`);
        },

        toggleNotificationReadStatus: (notificationId) => {
            return requester.put(`${apiUrl}/notifications/single/${notificationId}`);
        },

        markAllNotificationsAsRead: () => {
            return requester.put(`${apiUrl}/notifications/mark-all-read`);
        },

        // ===== ДАШБОРД И СТАТИСТИКИ (/dashboard) =====
        // Всички endpoints за статистики и отчети
        getDashboardStats: (period = '30d') => {
            return requester.get(`${apiUrl}/dashboard/stats?period=${period}`);
        },

        getVisitorsStatistics: (period = '30d') => {
            return requester.get(`${apiUrl}/dashboard/visitors?period=${period}`);
        },

        getReviewsStatistics: (period = '30d') => {
            return requester.get(`${apiUrl}/dashboard/reviews?period=${period}`);
        },

        // ===== ОТЧЕТИ (/dashboard/reports) =====
        // Endpoints за генериране на различни типове отчети
        generateReport: (reportType, period = '30d') => {
            return requester.get(`${apiUrl}/dashboard/reports/${reportType}?period=${period}`);
        },

        // НЕ Е ИМПЛЕМЕНТИРАНО - Експортиране на данни
        // exportData: (dataType, format = 'xlsx') => {
        //   return requester.get(`${apiUrl}/dashboard/export/${dataType}?format=${format}`, {
        //     responseType: 'blob'
        //   });
        // },

        // ===== ПУБЛИЧНИ ENDPOINTS =====
        // Endpoints които не изискват автентификация
        submitOrder: (orderData) => {
            return requester.post(`${apiUrl}/orders/create`, orderData);
        },

        submitReview: (reviewData) => {
            return requester.post(`${apiUrl}/reviews/create`, reviewData);
        },

        getPublicReviews: (filters = {}) => {
            const queryParams = new URLSearchParams();

            if (filters.page) queryParams.append('page', filters.page);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const queryString = queryParams.toString();
            return requester.get(`${apiUrl}/reviews/approved${queryString ? `?${queryString}` : ''}`);
        },

        // ===== НЕИЗПОЛЗВАНИ ENDPOINTS =====
        // Следните endpoints са в стария userService но не са имплементирани в backend:

        // getOrdersStatistics: (period = '30d') => {
        //   return requester.get(`${apiUrl}/sys/statistics/orders?period=${period}`);
        // },

        // getSystemStatistics: () => {
        //   return requester.get(`${apiUrl}/sys/statistics/system`);
        // },

        // getRatingsAndReviews: () => {
        //   return requester.get(`${apiUrl}/sys/reviews`);
        // },

        // getNotifications: () => {
        //   return requester.get(`${apiUrl}/sys/notifications`);
        // },

        // markNotificationAsRead: (notificationId) => {
        //   return requester.put(`${apiUrl}/sys/notifications/${notificationId}/read`);
        // },

        // generateReport: (reportType, period = '30d') => {
        //   return requester.get(`${apiUrl}/sys/reports/${reportType}?period=${period}`);
        // }
    };
};
