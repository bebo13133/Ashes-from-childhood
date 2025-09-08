import { requestFactory } from './requester';
const apiUrl = import.meta.env.VITE_API_URL;

export const userServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    // ===== AUTHENTICATION =====
    login: (data) => {
      return requester.post(`${apiUrl}/sys/login`, data);
    },

    logout: () => {
      return requester.post(`${apiUrl}/sys/logout`);
    },

    forgotPassword: (data) => {
      return requester.post(`${apiUrl}/sys/forgot-password`, data);
    },

    resetPassword: (data) => {
      return requester.post(`${apiUrl}/sys/reset-password`, data);
    },
    changePassword: (passwordData) => {
      return requester.put(`${apiUrl}/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
    },
    updateBookPrice: (price) => {
  return requester.put(`${apiUrl}/sys/book-price`, { price });
},

getBookPrice: () => {
  return requester.get(`${apiUrl}/sys/book-price`);
},
    // ===== DASHBOARD & STATISTICS =====
    getDashboardStats: () => {
      return requester.get(`${apiUrl}/sys/dashboard/stats`);
    },

    getVisitorsStatistics: (period = '30d') => {
      return requester.get(`${apiUrl}/sys/statistics/visitors?period=${period}`);
    },

    getOrdersStatistics: (period = '30d') => {
      return requester.get(`${apiUrl}/sys/statistics/orders?period=${period}`);
    },

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
      return requester.get(`${apiUrl}/sys/orders${queryString ? `?${queryString}` : ''}`);
    },

    getOrderById: (orderId) => {
      return requester.get(`${apiUrl}/sys/orders/${orderId}`);
    },

    updateOrderStatus: (orderId, status) => {
      return requester.put(`${apiUrl}/sys/orders/${orderId}/status`, {
        status,
        updatedAt: new Date().toISOString()
      });
    },

    deleteOrder: (orderId) => {
      return requester.delete(`${apiUrl}/sys/orders/${orderId}`);
    },

    // ===== REVIEWS MANAGEMENT =====
    getRatingsAndReviews: () => {
      return requester.get(`${apiUrl}/sys/reviews`);
    },

    updateReviewStatus: (reviewId, status) => {
      return requester.put(`${apiUrl}/sys/reviews/${reviewId}/status`, { status });
    },

    deleteReview: (reviewId) => {
      return requester.delete(`${apiUrl}/sys/reviews/${reviewId}`);
    },

    // ===== EMAIL MANAGEMENT =====
    sendEmail: (emailData) => {
      return requester.post(`${apiUrl}/sys/emails/send`, emailData);
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
    generateReport: (reportType, period = '30d') => {
      return requester.get(`${apiUrl}/sys/reports/${reportType}?period=${period}`);
    },

    exportData: (dataType, format = 'xlsx') => {
      return requester.get(`${apiUrl}/sys/export/${dataType}?format=${format}`, {
        responseType: 'blob'
      });
    },

    // ===== PUBLIC ENDPOINTS =====
    submitOrder: (orderData) => {
      return requester.post(`${apiUrl}/orders/book`, orderData);
    },

    submitReview: (reviewData) => {
      return requester.post(`${apiUrl}/reviews/submit`, reviewData);
    },

    getPublicReviews: () => {
      return requester.get(`${apiUrl}/reviews/approved`);
    },
    // Notifications endpoints
    getNotifications: () => {
      return requester.get(`${apiUrl}/sys/notifications`);
    },

    markNotificationAsRead: (notificationId) => {
      return requester.put(`${apiUrl}/sys/notifications/${notificationId}/read`);
    },

    markAllNotificationsAsRead: () => {
      return requester.put(`${apiUrl}/sys/notifications/mark-all-read`);
    }
  };
};