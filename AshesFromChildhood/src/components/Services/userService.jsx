import { requestFactory } from './requester';
const apiUrl = import.meta.env.VITE_API_URL;

export const userServiceFactory = (token) => {
  const requester = requestFactory(token);

  return {
    login: (data) => {
      return requester.post(`${apiUrl}/auth/login`, data);
    },
    logout: () => {
      return requester.post(`${apiUrl}/auth/logout`);
    },
    // Book order endpoint
    submitOrder: (orderData) => {
      return requester.post(`${apiUrl}/orders/book`, orderData);
    }
  };
};
