import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Let React Router handle navigation instead of hard redirect
        window.dispatchEvent(new CustomEvent('auth-logout'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/api/users/register', userData),
  login: (credentials) => api.post('/api/users/login', credentials),
  getCurrentUser: () => api.get('/api/users/me'),
};

// Friends API calls
export const friendsAPI = {
  getFriends: () => api.get('/api/friends'),
  addFriend: (friendEmail) => api.post('/api/friends/add', { friendEmail }),
};

// Expenses API calls
export const expensesAPI = {
  getExpenses: () => api.get('/api/expenses'),
  createExpense: (expenseData) => api.post('/api/expenses', expenseData),
};

// Settlements API calls
export const settlementsAPI = {
  getSettlements: () => api.get('/api/settlements'),
  createSettlement: (settlementData) => api.post('/api/settlements', settlementData),
};

// Debts API calls
export const debtsAPI = {
  getDebts: () => api.get('/api/debts'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;