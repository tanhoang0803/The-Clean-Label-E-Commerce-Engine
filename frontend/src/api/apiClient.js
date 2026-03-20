import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s — generous for OpenAI calls which can be slow
});

// Request interceptor — attach JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 by clearing auth and redirecting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Skip redirect if the failing request was itself an auth endpoint
    // to avoid an infinite redirect loop on the login page.
    const isAuthRoute = requestUrl.includes('/auth/');

    // Only treat 401 as session expiry on auth-protected routes, not on /orders
    // (Stripe mis-configuration returns 401 from the backend and must not log the user out)
    const isOrdersRoute = requestUrl.includes('/orders/');

    if (status === 401 && !isAuthRoute && !isOrdersRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/products';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
