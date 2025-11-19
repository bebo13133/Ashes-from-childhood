/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from '../Hooks/useLocalStorage';
import { userServiceFactory } from '../Services/userService';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuth, setIsAuth] = useLocalStorage('adminAuth', {});
    const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin', false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [publicReviewsCache, setPublicReviewsCache] = useState(null);
    const [publicReviewsCacheTime, setPublicReviewsCacheTime] = useState(null);
    const publicReviewsCachePromiseRef = useRef(null);
    // Admin specific states
    const [dashboardData, setDashboardData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [visitorsStats, setVisitorsStats] = useState(null);
    const [ratingsData, setRatingsData] = useState(null);
    const [bookPrice, setBookPrice] = useState({
        bgn: 28.0,
        eur: null,
    });
    const [bookStock, setBookStock] = useState(234);
    const navigate = useNavigate();
    // Функция за конвертиране
    const convertToEur = (bgnPrice) => {
        const exchangeRate = 1.95583;
        return bgnPrice / exchangeRate;
    };

    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);

    // Email selection states
    const [selectedOrder, setSelectedOrder] = useState(null);

    const userService = userServiceFactory(isAuth.token);
    useEffect(() => {
        if (isAuth.token && isAuth.role === 'admin') {
            setIsAdmin(true);
            // Зареждайте нотификациите при успешен login
            fetchNotifications().catch(console.error);
        }
    }, [isAuth]);

    useEffect(() => {
        if (isAuth.token && isAuth.role === 'admin') {
            setIsAdmin(true);
        }
    }, [isAuth, setIsAdmin]);

    const showErrorAndSetTimeout = (error) => {
        setErrorMessage(error);
        setTimeout(() => {
            setErrorMessage('');
        }, 300);
    };

    // ===== NOTIFICATIONS FUNCTIONS =====
    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };

        setNotifications((prev) => {
            // Add new notification at the beginning and keep only last 50
            const updated = [newNotification, ...prev];
            return updated.slice(0, 50);
        });
    };
    // Добавете тази функция в userContext.jsx:
    const fetchNotifications = async () => {
        setNotificationsLoading(true);
        try {
            const response = await userService.getNotifications();
            setNotifications(response.notifications || response || []);
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
            throw error;
        } finally {
            setNotificationsLoading(false);
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await userService.markNotificationAsRead(notificationId);

            setNotifications((prev) => prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            await userService.markAllNotificationsAsRead();

            setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    };

    const removeNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // ===== AUTH FUNCTIONS =====
    const onLoginSubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.login(data);

            // if (response.user.role !== 'admin') {
            //   throw new Error('Access denied. Admin privileges required.');
            // }

            const authData = {
                token: response.token,
                email: response.user.email,
                role: response.user.role,
                name: response.user.name || response.user.email,
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
                role: 'admin',
            };

            const response = await userService.register(registerData);

            const authData = {
                token: response.token,
                email: response.user.email,
                role: response.user.role,
                name: response.user.name,
            };

            setIsAuth(authData);
            setIsAdmin(true);

            return {
                success: true,
                message: 'Акаунтът е създаден успешно!',
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
            setNotifications([]);
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
                message: 'Инструкции за възстановяване са изпратени на вашия имейл.',
            };
        } catch (error) {
            const errorMsg = error.message || 'Грешка при изпращането. Моля, опитайте отново.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    // Добави тази функция в contextValue секцията
    const resetPassword = async (resetData) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.resetPassword(resetData);

            return {
                success: true,
                message: 'Паролата е сменена успешно!',
            };
        } catch (error) {
            let errorMsg = 'Грешка при смяна на паролата.';

            if (error.message.includes('token')) {
                errorMsg = 'Невалиден или изтекъл линк за възстановяване.';
            } else if (error.message.includes('password')) {
                errorMsg = 'Паролата не отговаря на изискванията.';
            } else if (error.message) {
                errorMsg = error.message;
            }

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
            setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order)));

            // Refresh book stock since completing/cancelling orders affects stock
            if (status === 'completed' || status === 'cancelled' || status === 'pending') {
                try {
                    await fetchBookPrice();
                } catch (error) {
                    console.error('Error refreshing book stock:', error);
                }
            }

            return response;
        } catch (error) {
            const errorMsg = error.message || 'Грешка при обновяване на поръчката.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const fetchOrderById = async (orderId) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.getOrderById(orderId);
            return response;
        } catch (error) {
            const errorMsg = error.message || 'Грешка при зареждане на поръчката.';
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
            // Get order before deleting to check if it was completed
            const orderToDelete = orders.find((order) => order.id === orderId);
            const wasCompleted = orderToDelete?.status === 'completed';

            await userService.deleteOrder(orderId);

            // Update local state
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));

            // Refresh book stock if deleted order was completed (stock was restored)
            if (wasCompleted) {
                try {
                    await fetchBookPrice();
                } catch (error) {
                    console.error('Error refreshing book stock:', error);
                }
            }

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
    const fetchRatingsData = async (filters = {}) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.getRatingsAndReviews(filters);
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
    const fetchPublicReviews = useCallback(
        async (filters = {}) => {
            // Кеш за 5 минути
            const CACHE_DURATION = 5 * 60 * 1000;
            const now = Date.now();

            // Ако имаме кеширани данни и не са изтекли
            if (publicReviewsCache && publicReviewsCacheTime && now - publicReviewsCacheTime < CACHE_DURATION) {
                // Филтрираме от кеша според limit
                if (filters.limit && publicReviewsCache.reviews) {
                    return {
                        ...publicReviewsCache,
                        reviews: publicReviewsCache.reviews.slice(0, filters.limit),
                    };
                }
                return publicReviewsCache;
            }

            // Проверка дали вече има заявка в ход
            if (publicReviewsCachePromiseRef.current) {
                return await publicReviewsCachePromiseRef.current;
            }

            // Създаваме promise за текущата заявка
            publicReviewsCachePromiseRef.current = (async () => {
                try {
                    // Винаги зареждаме повече данни за кеша
                    const response = await userService.getPublicReviews({ limit: 1000 });

                    // Кешираме пълните данни
                    setPublicReviewsCache(response);
                    setPublicReviewsCacheTime(now);

                    // Връщаме филтрираните данни
                    if (filters.limit && response.reviews) {
                        return {
                            ...response,
                            reviews: response.reviews.slice(0, filters.limit),
                        };
                    }

                    return response;
                } catch (error) {
                    console.error('Error fetching public reviews:', error);
                    return { reviews: [], totalReviews: 0, averageRating: 0 };
                } finally {
                    publicReviewsCachePromiseRef.current = null;
                }
            })();

            return await publicReviewsCachePromiseRef.current;
        },
        [publicReviewsCache, publicReviewsCacheTime]
    );

    const fetchImageReviews = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.getImageReviews();
            return response.imageReviews || [];
        } catch (error) {
            console.error('Error fetching image reviews:', error);
            return [];
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
                setRatingsData((prev) => ({
                    ...prev,
                    reviews: prev.reviews.map((review) => (review.id === reviewId ? { ...review, status } : review)),
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

            // Add notification for admin about new review
            addNotification({
                type: 'review',
                title: 'Нов отзив',
                message: `Нов отзив с ${reviewData.rating} звезди чака одобрение`,
            });

            return {
                success: true,
                message: 'Отзивът е изпратен успешно! Ще бъде публикуван след одобрение.',
                reviewId: response.reviewId || response.id,
            };
        } catch (error) {
            const errorMsg = error.message || 'Грешка при изпращане на отзива. Моля, опитайте отново.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const markReviewAsHelpful = async (reviewId) => {
        try {
            const response = await userService.markReviewAsHelpful(reviewId);
            return response;
        } catch (error) {
            console.error('Error marking review as helpful:', error);
            throw error;
        }
    };
    const fetchReviewsStatistics = async (period = '30d') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.getReviewsStatistics(period);
            return response;
        } catch (error) {
            const errorMsg = error.message || 'Грешка при зареждане на статистиките за отзиви.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };
    const deleteReview = async (reviewId) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            await userService.deleteReview(reviewId);

            // Update local state
            if (ratingsData?.reviews) {
                setRatingsData((prev) => ({
                    ...prev,
                    reviews: prev.reviews.filter((review) => review.id !== reviewId),
                }));
            }

            return { success: true, message: 'Отзивът е изтрит успешно.' };
        } catch (error) {
            const errorMsg = error.message || 'Грешка при изтриване на отзива.';
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
                ...response,
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
                ...response,
            };
        } catch (error) {
            const errorMsg = error.message || 'Грешка при изпращане на масовия имейл.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getEmailTemplates = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.getEmailTemplates();
            return response;
        } catch (error) {
            const errorMsg = error.message || 'Грешка при зареждане на шаблоните.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateEmailTemplate = async (templateId, templateData) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.updateEmailTemplate(templateId, templateData);
            return response;
        } catch (error) {
            const errorMsg = error.message || 'Грешка при запазване на шаблона.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const createEmailTemplate = async (templateData) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await userService.createEmailTemplate(templateData);
            return response;
        } catch (error) {
            const errorMsg = error.message || 'Грешка при създаване на шаблона.';
            showErrorAndSetTimeout(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEmailTemplate = async (templateId) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            await userService.deleteEmailTemplate(templateId);
        } catch (error) {
            const errorMsg = error.message || 'Грешка при изтриване на шаблона.';
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

            // Add notification for admin about new order
            addNotification({
                type: 'order',
                title: 'Нова поръчка',
                message: `Поръчка от ${orderData.firstName} ${orderData.lastName} за "${orderData.bookTitle}"`,
            });

            return {
                success: true,
                message: 'Поръчката е изпратена успешно!',
                orderId: response.orderId,
            };
        } catch (error) {
            const errorMsg = error.message || 'Грешка при изпращане на поръчката. Моля, опитайте отново.';
            showErrorAndSetTimeout(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };
    const changePassword = async (passwordData) => {
        try {
            const response = await userService.changePassword(passwordData);
            return response;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    };
    const updateBookPrice = async (newPrice) => {
        try {
            const response = await userService.updateBookPrice(newPrice);

            // Обновете локалното bookPrice състояние
            setBookPrice(newPrice);

            return response;
        } catch (error) {
            console.error('Error updating book price:', error);
            throw error;
        }
    };

    // Поправете fetchBookPrice функцията:
    const fetchBookPrice = useCallback(async () => {
        try {
            const response = await userService.getBookPrice();
            // Обработете отговора правилно според структурата от API
            const bgnPrice = response.price || response.bookPrice || response || 28.0;
            const priceObj = {
                bgn: Number(bgnPrice),
                eur: convertToEur(Number(bgnPrice)),
            };
            setBookPrice(priceObj);
            // Also update stock if available
            if (response.stock !== undefined) {
                setBookStock(response.stock);
            }
            return priceObj;
        } catch (error) {
            console.error('Error fetching book price:', error);
            const defaultPrice = {
                bgn: 28.0,
                eur: convertToEur(28.0),
            };
            setBookPrice(defaultPrice);
            return defaultPrice;
        }
    }, [userService]);

    const updateBookStock = useCallback(
        async (stock) => {
            try {
                const response = await userService.updateBookStock(stock);
                setBookStock(response.stock || stock);
                return response;
            } catch (error) {
                console.error('Error updating book stock:', error);
                throw error;
            }
        },
        [userService]
    );

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
        changePassword,
        resetPassword,
        // Admin data
        dashboardData,
        orders,
        visitorsStats,
        ratingsData,

        // Notifications data and actions
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        clearAllNotifications,
        fetchNotifications,

        // Email selection
        selectedOrder,
        setSelectedOrder,

        // Admin actions
        fetchDashboardData,
        fetchOrderById,
        fetchOrders,
        updateOrderStatus,
        deleteOrder,
        fetchVisitorsStats,
        fetchRatingsData,
        updateReviewStatus,
        sendEmailToCustomer,
        sendBulkEmail,
        getEmailTemplates,
        updateEmailTemplate,
        createEmailTemplate,
        deleteEmailTemplate,
        generateReport,
        exportData,
        deleteReview,
        // Public actions (for regular users)
        submitBookOrder,
        submitReview,
        bookPrice: bookPrice?.bgn || 28.0,
        bookStock,
        updateBookPrice,
        updateBookStock,
        fetchBookPrice,
        fetchPublicReviews,
        markReviewAsHelpful,
        fetchReviewsStatistics,
        fetchImageReviews,
        // UI state
        isLoading,
        errorMessage,
        clearError: () => setErrorMessage(''),
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
