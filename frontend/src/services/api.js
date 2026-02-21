import axiosClient from './axios';

// Auth API
export const authAPI = {
  login: (email, phone, password) => axiosClient.post('/api/auth/login', { email, phone, password }),
  register: (name, email, phone, password) => axiosClient.post('/api/auth/register', { name, email, phone, password }),
  logout: () => axiosClient.post('/api/auth/logout'),
};

// Friends API
export const friendsAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/api/friends', { params: { search, page, limit } }),
  add: (data) => axiosClient.post('/api/friends', data),
  update: (id, data) => axiosClient.put(`/api/friends/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/friends/${id}`),
};

// Expenses API
export const expensesAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/api/expenses', { params: { search, page, limit } }),
  create: (data) => axiosClient.post('/api/expenses', data),
  update: (id, data) => axiosClient.put(`/api/expenses/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/expenses/${id}`),
};

// Groups API
export const groupsAPI = {
  getAll: () => axiosClient.get('/api/groups'),
  create: (data) => axiosClient.post('/api/groups', data),
  update: (id, data) => axiosClient.put(`/api/groups/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/groups/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getMonthlySummary: (months = 6) => axiosClient.get('/api/analytics/monthly', { params: { months } }),
  getCategoryBreakdown: () => axiosClient.get('/api/analytics/categories'),
};

// Debts API
export const debtsAPI = {
  getAll: () => axiosClient.get('/api/debts'),
  settle: (id) => axiosClient.post(`/api/debts/${id}/settle`),
};

// Settlements API
export const settlementsAPI = {
  getAll: () => axiosClient.get('/api/settlements'),
  create: (data) => axiosClient.post('/api/settlements', data),
};

// Group Transactions API
export const groupTransactionsAPI = {
  getByGroup: (groupId) => axiosClient.get(`/api/group-transactions/${groupId}`),
  create: (data) => axiosClient.post('/api/group-transactions', data),
};

export default axiosClient;
