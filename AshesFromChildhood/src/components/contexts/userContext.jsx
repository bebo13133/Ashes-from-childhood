/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { userServiceFactory } from '../Services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useLocalStorage('adminAuth', {});
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin specific states
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [visitorsStats, setVisitorsStats] = useState(null);
  const [ratingsData, setRatingsData] = useState(null);
  
  const userService = userServiceFactory(isAuth.token);

  useEffect(() => {
    if (isAuth.token && isAuth.role === 'admin') {
      setIsAdmin(true);
    }
  }, [isAuth, setIsAdmin]);

  const showErrorAndSetTimeout = (error) => {
    setErrorMessage(error);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  // ===== AUTH FUNCTIONS =====
  const onLoginSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.login(data);
      
      if (response.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      const authData = {
        token: response.token,
        email: response.user.email,
        role: response.user.role,
        name: response.user.name || response.user.email
      };

      setIsAuth(authData);
      setIsAdmin(true);
      
      return { success: true };
      
    } catch (error) {
      const errorMsg = error.message || 'Login failed. Please try again.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'admin'
      };

      const response = await userService.register(registerData);
      
      const authData = {
        token: response.token,
        email: response.user.email,
        role: response.user.role,
        name: response.user.name
      };

      setIsAuth(authData);
      setIsAdmin(true);
      
      return { 
        success: true, 
        message: 'Акаунтът е създаден успешно!' 
      };
      
    } catch (error) {
      let errorMsg = 'Registration failed. Please try again.';
      
      if (error.message.includes('email')) {
        errorMsg = 'Този имейл вече е регистриран в системата.';
      } else if (error.message.includes('validation')) {
        errorMsg = 'Моля, проверете въведените данни.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = async () => {
    setIsLoading(true);
    
    try {
      if (isAuth.token) {
        await userService.logout?.();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuth({});
      setIsAdmin(false);
      setDashboardData(null);
      setOrders([]);
      setVisitorsStats(null);
      setRatingsData(null);
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (email) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await userService.forgotPassword({ email });
      return { 
        success: true, 
        message: 'Инструкции за възстановяване са изпратени на вашия имейл.' 
      };
    } catch (error) {
      const errorMsg = error.message || 'Грешка при изпращането. Моля, опитайте отново.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ADMIN DASHBOARD FUNCTIONS =====
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.getDashboardStats();
      setDashboardData(response);
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при зареждане на статистиките.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ORDERS MANAGEMENT =====
  const fetchOrders = async (filters = {}) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.getAllOrders(filters);
      setOrders(response.orders || response);
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при зареждане на поръчките.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.updateOrderStatus(orderId, status);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );
      
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при обновяване на поръчката.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await userService.deleteOrder(orderId);
      
      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      return { success: true, message: 'Поръчката е изтрита успешно.' };
    } catch (error) {
      const errorMsg = error.message || 'Грешка при изтриване на поръчката.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== VISITORS STATISTICS =====
  const fetchVisitorsStats = async (period = '30d') => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.getVisitorsStatistics(period);
      setVisitorsStats(response);
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при зареждане на статистиките за посетители.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RATINGS AND REVIEWS =====
  const fetchRatingsData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.getRatingsAndReviews();
      setRatingsData(response);
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при зареждане на рейтингите.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.updateReviewStatus(reviewId, status);
      
      // Update local state if needed
      if (ratingsData?.reviews) {
        setRatingsData(prev => ({
          ...prev,
          reviews: prev.reviews.map(review => 
            review.id === reviewId ? { ...review, status } : review
          )
        }));
      }
      
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при обновяване на отзива.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== SUBMIT REVIEW (for regular users) =====
  const submitReview = async (reviewData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.submitReview(reviewData);
      return { 
        success: true, 
        message: 'Отзивът е изпратен успешно! Ще бъде публикуван след одобрение.',
        reviewId: response.reviewId 
      };
    } catch (error) {
      const errorMsg = error.message || 'Грешка при изпращане на отзива. Моля, опитайте отново.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== EMAIL MANAGEMENT =====
  const sendEmailToCustomer = async (emailData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.sendEmail(emailData);
      return { 
        success: true, 
        message: 'Имейлът е изпратен успешно!',
        ...response 
      };
    } catch (error) {
      const errorMsg = error.message || 'Грешка при изпращане на имейла.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendBulkEmail = async (emailData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.sendBulkEmail(emailData);
      return { 
        success: true, 
        message: 'Масовият имейл е изпратен успешно!',
        ...response 
      };
    } catch (error) {
      const errorMsg = error.message || 'Грешка при изпращане на масовия имейл.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== REPORTS =====
  const generateReport = async (reportType, period = '30d') => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.generateReport(reportType, period);
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при генериране на отчета.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async (dataType, format = 'xlsx') => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.exportData(dataType, format);
      return response;
    } catch (error) {
      const errorMsg = error.message || 'Грешка при експортиране на данните.';
      showErrorAndSetTimeout(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ===== BOOK ORDER (for regular users) =====
  const submitBookOrder = async (orderData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await userService.submitOrder(orderData);
      return { 
        success: true, 
        message: 'Поръчката е изпратена успешно!',
        orderId: response.orderId 
      };
    } catch (error) {
      const errorMsg = error.message || 'Грешка при изпращане на поръчката. Моля, опитайте отново.';
      showErrorAndSetTimeout(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    // Auth state
    isAuthenticated: !!isAuth.token && isAdmin,
    isAdmin,
    adminEmail: isAuth.email,
    adminName: isAuth.name,
    token: isAuth.token,
    
    // Auth actions
    onLoginSubmit,
    onRegisterSubmit,
    onForgotPasswordSubmit,
    onLogout,
    
    // Admin data
    dashboardData,
    orders,
    visitorsStats,
    ratingsData,
    
    // Admin actions
    fetchDashboardData,
    fetchOrders,
    updateOrderStatus,
    deleteOrder,
    fetchVisitorsStats,
    fetchRatingsData,
    updateReviewStatus,
    sendEmailToCustomer,
    sendBulkEmail,
    generateReport,
    exportData,
    
    // Public actions (for regular users)
    submitBookOrder,
    submitReview,
    
    // UI state
    isLoading,
    errorMessage,
    clearError: () => setErrorMessage('')
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};