import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(() => axiosClient(originalRequest));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, phone, password) => axiosClient.post('/api/v1/auth/login', { email, phone, password }),
  register: (name, email, phone, password) => axiosClient.post('/api/v1/auth/register', { name, email, phone, password }),
  logout: () => axiosClient.post('/api/v1/auth/logout'),
  refresh: () => axiosClient.post('/api/v1/auth/refresh'),
};

export const friendsAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/api/v1/friends', { params: { search, page, limit } }),
  add: (data) => axiosClient.post('/api/v1/friends', data),
  update: (id, data) => axiosClient.put(`/api/v1/friends/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/friends/${id}`),
};

export const expensesAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/api/v1/expenses', { params: { search, page, limit } }),
  create: (data) => axiosClient.post('/api/v1/expenses', data),
  update: (id, data) => axiosClient.put(`/api/v1/expenses/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/v1/expenses/${id}`),
};

export const groupsAPI = {
  getAll: () => axiosClient.get('/api/groups'),
  create: (data) => axiosClient.post('/api/groups', data),
  update: (id, data) => axiosClient.put(`/api/groups/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/groups/${id}`),
};

export const analyticsAPI = {
  getMonthlySummary: (months = 6) => axiosClient.get('/api/v1/analytics/monthly', { params: { months } }),
  getCategoryBreakdown: () => axiosClient.get('/api/v1/analytics/categories'),
};

export const debtsAPI = {
  getAll: () => axiosClient.get('/api/v1/debts'),
  settle: (id) => axiosClient.post(`/api/v1/debts/${id}/settle`),
};

export const settlementsAPI = {
  getAll: () => axiosClient.get('/api/settlements'),
  getHistory: (search, page = 1, limit = 10) => axiosClient.get('/api/settlements/history', { params: { search, page, limit } }),
  create: (data) => axiosClient.post('/api/settlements', data),
};

export const groupTransactionsAPI = {
  getByGroup: (groupId) => axiosClient.get(`/api/group-transactions/${groupId}`),
  create: (data) => axiosClient.post('/api/group-transactions', data),
};

export default axiosClient;
