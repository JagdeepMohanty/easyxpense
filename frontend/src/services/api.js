import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://easyxpense.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/api/expenses'),
  create: (expenseData) => api.post('/api/expenses', expenseData),
};

// Debts API
export const debtsAPI = {
  getAll: () => api.get('/api/debts'),
};

// Settlements API
export const settlementsAPI = {
  create: (settlementData) => api.post('/api/settlements', settlementData),
  getHistory: () => api.get('/api/settlements'),
};

// Friends API
export const friendsAPI = {
  getAll: () => api.get('/api/friends'),
  add: (friendData) => api.post('/api/friends', friendData),
};

export default api;