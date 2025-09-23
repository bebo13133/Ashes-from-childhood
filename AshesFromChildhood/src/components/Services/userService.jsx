import { requestFactory } from './requester';
const apiUrl = import.meta.env.VITE_API_URL;

export const userServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===== AUTHENTICATION =====
    login: (data) => {
      return requester.post(`${apiUrl}/auth/login`, data);
    },

    logout: () => {
      return requester.post(`${apiUrl}/sys/logout`);
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
    updateBookPrice: (price) => {
      return requester.put(`${apiUrl}/books/book-price`, { price });
    },


    getBookPrice: () => {
      return requester.get(`${apiUrl}/books/book-price`);
    },
    // ===== DASHBOARD & STATISTICS =====
    getDashboardStats: (period = '30d') => {
      return requester.get(`${apiUrl}/dashboard/stats?period=${period}`);
    },
    getVisitorsStatistics: (period = '30d') => {
            return requester.get(`${apiUrl}/dashboard/visitors?period=${period}`);
        },

    // getOrdersStatistics: (period = '30d') => {
    //   return requester.get(`${apiUrl}/sys/statistics/orders?period=${period}`);
    // },

    getSystemStatistics: () => {
      return requester.get(`${apiUrl}/sys/statistics/system`);
    },

    // ===== ORDERS MANAGEMENT =====
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
      return requester.get(`${apiUrl}/orders/${orderId}`);
    },

    updateOrderStatus: (orderId, status) => {
      return requester.put(`${apiUrl}/orders/update-status/${orderId}`, { status });
    },


    deleteOrder: (orderId) => {
      return requester.del(`${apiUrl}/orders/${orderId}`);
    },

    // ===== REVIEWS MANAGEMENT =====
    getRatingsAndReviews: (filters = {}) => {
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const queryString = queryParams.toString();
      return requester.get(`${apiUrl}/reviews/all${queryString ? `?${queryString}` : ''}`);
    },

    updateReviewStatus: (reviewId, status) => {
      return requester.put(`${apiUrl}/reviews/update-status/${reviewId}`, { status });
    },
    getApprovedReviews: (filters = {}) => {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const queryString = queryParams.toString();
      return requester.get(`${apiUrl}/reviews/approved${queryString ? `?${queryString}` : ''}`);
    },
    deleteReview: (reviewId) => {
      return requester.del(`${apiUrl}/reviews/single/${reviewId}`);
    },
    markReviewAsHelpful: (reviewId) => {
      return requester.put(`${apiUrl}/reviews/helpful/${reviewId}`);
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
    // ===== EMAIL MANAGEMENT =====
    sendEmail: (emailData) => {
      return requester.post(`${apiUrl}/emails/send`, emailData);
    },

    sendBulkEmail: (emailData) => {
      return requester.post(`${apiUrl}/sys/emails/bulk-send`, emailData);
    },

    getEmailTemplates: () => {
      return requester.get(`${apiUrl}/sys/emails/templates`);
    },

    // getEmailHistory: (filters = {}) => {
    //   const queryString = new URLSearchParams(filters).toString();
    //   return requester.get(`${apiUrl}/sys/emails/history${queryString ? `?${queryString}` : ''}`);
    // },

    // ===== REPORTS & ANALYTICS =====
    // Endpoints за генериране на различни типове отчети
   generateReport: (reportType, period = '30d') => {
            return requester.get(`${apiUrl}/dashboard/reports/${reportType}?period=${period}`);
        },

    exportData: (dataType, format = 'xlsx') => {
      return requester.get(`${apiUrl}/sys/export/${dataType}?format=${format}`, {
        responseType: 'blob'
      });
    },

    // ===== PUBLIC ENDPOINTS =====
    submitOrder: (orderData) => {
      return requester.post(`${apiUrl}/orders/create`, orderData);
    },

    // Notifications endpoints
    getNotifications: () => {
      return requester.get(`${apiUrl}/notifications/all`);
    },

    markNotificationAsRead: (notificationId) => {
      return requester.put(`${apiUrl}/notifications/single/${notificationId}`);
    },

    markAllNotificationsAsRead: () => {
      return requester.put(`${apiUrl}/notifications/mark-all-read`);
    },
  };
};