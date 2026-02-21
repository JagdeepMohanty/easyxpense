import axios from 'axios';

// Validate API URL to prevent SSRF
const validateApiUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const allowedHosts = ['localhost', '127.0.0.1', 'easyxpense.onrender.com'];
    const allowedPorts = ['3000', '5000', '5173', '443', '80'];
    
    if (!allowedHosts.includes(parsedUrl.hostname) && 
        !parsedUrl.hostname.endsWith('.onrender.com') &&
        !parsedUrl.hostname.endsWith('.netlify.app')) {
      throw new Error('Invalid API host');
    }
    
    if (parsedUrl.port && !allowedPorts.includes(parsedUrl.port)) {
      throw new Error('Invalid API port');
    }
    
    return url;
  } catch (error) {
    throw new Error('Invalid API URL');
  }
};

const API_URL = validateApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Max retry attempts for cold start
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Create axios instance with increased timeout
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for cold start
});

// Retry logic for failed requests
const retryRequest = async (error, retryCount = 0) => {
  const originalRequest = error.config;
  
  // Only retry on network errors or 5xx errors
  if (!error.response && retryCount < MAX_RETRIES && !originalRequest._retry) {
    originalRequest._retry = true;
    originalRequest.retryCount = retryCount;
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
    
    return axiosClient(originalRequest);
  }
  
  return Promise.reject(error);
};

// Request interceptor for adding JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors with retry logic
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle cold start - network errors with retry
    if (!error.response && originalRequest) {
      const retryCount = originalRequest.retryCount || 0;
      return retryRequest(error, retryCount);
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
export const isServerWaking = (error) => {
  return !error.response && error.code === 'ECONNABORTED';
};
