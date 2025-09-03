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
      setIsLoading(false);
    }
  };

  // Book order function
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
    onLogout,
    
    // Book order action
    submitBookOrder,
    
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