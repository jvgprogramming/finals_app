import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Automatically attach auth token from localStorage to every request
AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally — clear token and redirect to login
AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? '');
    const isAuthAttempt =
      url.includes('/auth/login') || url.includes('/auth/register');

    // Only clear session on 401 for protected routes (not failed login/register)
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;
