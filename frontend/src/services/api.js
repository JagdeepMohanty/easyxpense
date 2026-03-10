import axios from 'axios';

const axiosClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
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
        
        // CRITICAL FIX: Remove user from localStorage to prevent redirect loop
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, phone, password) => axiosClient.post('/auth/login', { email, phone, password }),
  register: (name, email, phone, password) => axiosClient.post('/auth/register', { name, email, phone, password }),
  logout: () => axiosClient.post('/auth/logout'),
  refresh: () => axiosClient.post('/auth/refresh'),
};

export const friendsAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/friends', { params: { search, page, limit } }),
  add: (data) => axiosClient.post('/friends', data),
  update: (id, data) => axiosClient.put(`/friends/${id}`, data),
  delete: (id) => axiosClient.delete(`/friends/${id}`),
};

export const expensesAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/expenses', { params: { search, page, limit } }),
  create: (data) => axiosClient.post('/expenses', data),
  update: (id, data) => axiosClient.put(`/expenses/${id}`, data),
  delete: (id) => axiosClient.delete(`/expenses/${id}`),
};

export const groupsAPI = {
  getAll: () => axiosClient.get('/groups'),
  create: (data) => axiosClient.post('/groups', data),
  update: (id, data) => axiosClient.put(`/groups/${id}`, data),
  delete: (id) => axiosClient.delete(`/groups/${id}`),
};

export const analyticsAPI = {
  getMonthlySummary: (months = 6) => axiosClient.get('/analytics/monthly', { params: { months } }),
  getCategoryBreakdown: () => axiosClient.get('/analytics/categories'),
};

export const debtsAPI = {
  getAll: () => axiosClient.get('/debts'),
  settle: (id) => axiosClient.post(`/debts/${id}/settle`),
};

export const settlementsAPI = {
  getAll: () => axiosClient.get('/settlements'),
  getHistory: (search, page = 1, limit = 10) => axiosClient.get('/settlements/history', { params: { search, page, limit } }),
  create: (data) => axiosClient.post('/settlements', data),
};

export const groupTransactionsAPI = {
  getByGroup: (groupId) => axiosClient.get(`/group-transactions/${groupId}`),
  create: (data) => axiosClient.post('/group-transactions', data),
};

export default axiosClient;
