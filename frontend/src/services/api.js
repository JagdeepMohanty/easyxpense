import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return axiosClient(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, phone, password) => axiosClient.post('/api/auth/login', { email, phone, password }),
  register: (name, email, phone, password) => axiosClient.post('/api/auth/register', { name, email, phone, password }),
  logout: () => axiosClient.post('/api/auth/logout'),
  refresh: () => axiosClient.post('/api/auth/refresh'),
};

export const friendsAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/api/friends', { params: { search, page, limit } }),
  add: (data) => axiosClient.post('/api/friends', data),
  update: (id, data) => axiosClient.put(`/api/friends/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/friends/${id}`),
};

export const expensesAPI = {
  getAll: (search, page = 1, limit = 10) => axiosClient.get('/api/expenses', { params: { search, page, limit } }),
  create: (data) => axiosClient.post('/api/expenses', data),
  update: (id, data) => axiosClient.put(`/api/expenses/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/expenses/${id}`),
};

export const groupsAPI = {
  getAll: () => axiosClient.get('/api/groups'),
  create: (data) => axiosClient.post('/api/groups', data),
  update: (id, data) => axiosClient.put(`/api/groups/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/groups/${id}`),
};

export const analyticsAPI = {
  getMonthlySummary: (months = 6) => axiosClient.get('/api/analytics/monthly', { params: { months } }),
  getCategoryBreakdown: () => axiosClient.get('/api/analytics/categories'),
};

export const debtsAPI = {
  getAll: () => axiosClient.get('/api/debts'),
  settle: (id) => axiosClient.post(`/api/debts/${id}/settle`),
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
