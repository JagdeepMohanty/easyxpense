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

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, phone, password) => api.post('/api/auth/login', { email, phone, password }),
  register: (name, email, phone, password) => api.post('/api/auth/register', { name, email, phone, password }),
  logout: () => api.post('/api/auth/logout'),
};

export const friendsAPI = {
  getAll: (search, page = 1, limit = 10) => api.get('/api/friends', { params: { search, page, limit } }),
  add: (data) => api.post('/api/friends', data),
  update: (id, data) => api.put(`/api/friends/${id}`, data),
  delete: (id) => api.delete(`/api/friends/${id}`),
};

export const expensesAPI = {
  getAll: (search, page = 1, limit = 10) => api.get('/api/expenses', { params: { search, page, limit } }),
  create: (data) => api.post('/api/expenses', data),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

export const groupsAPI = {
  getAll: () => api.get('/api/groups'),
  create: (data) => api.post('/api/groups', data),
  update: (id, data) => api.put(`/api/groups/${id}`, data),
  delete: (id) => api.delete(`/api/groups/${id}`),
};

export const analyticsAPI = {
  getMonthlySummary: (months = 6) => api.get('/api/analytics/monthly', { params: { months } }),
  getCategoryBreakdown: () => api.get('/api/analytics/categories'),
};

export default api;