import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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