import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s for Render cold starts
});

// Track if refresh is in progress to avoid multiple refresh calls
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, logout
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token: newRefreshToken, token } = response.data;
        const newAccessToken = access_token || token;

        // Update stored tokens
        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Server may be starting up (Render cold start). Please try again.';
    } else if (error.response) {
      // Server responded with error
      const data = error.response.data;
      if (data.error) {
        error.message = data.error;
      } else if (data.message) {
        error.message = data.message;
      } else {
        error.message = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // Request made but no response
      error.message = 'Cannot reach server. Please check your connection or try again later.';
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function for retrying requests (for cold starts)
const retryRequest = async (requestFn, retries = 2, delay = 2000) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || !error.response)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retrying request... (${retries} attempts left)`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(requestFn, retries - 1, delay);
    }
    throw error;
  }
};

export const expensesAPI = {
  getAll: (groupId, page = 1, limit = 8) => {
    let url = '/api/expenses';
    const params = [];
    if (groupId) params.push(`group_id=${groupId}`);
    params.push(`page=${page}`);
    params.push(`limit=${limit}`);
    if (params.length) url += '?' + params.join('&');
    return retryRequest(() => api.get(url));
  },
  create: (expenseData) => api.post('/api/expenses', expenseData),
  update: (id, expenseData) => api.put(`/api/expenses/${id}`, expenseData),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

export const debtsAPI = {
  getAll: (groupId, optimize = true) => {
    let url = '/api/debts';
    const params = [];
    if (groupId) params.push(`group_id=${groupId}`);
    if (!optimize) params.push('optimize=false');
    if (params.length) url += '?' + params.join('&');
    return retryRequest(() => api.get(url));
  },
};

export const settlementsAPI = {
  create: (settlementData) => api.post('/api/settlements', settlementData),
  getHistory: (groupId, page = 1, limit = 10) => {
    let url = '/api/settlements';
    const params = [];
    if (groupId) params.push(`group_id=${groupId}`);
    params.push(`page=${page}`);
    params.push(`limit=${limit}`);
    if (params.length) url += '?' + params.join('&');
    return retryRequest(() => api.get(url));
  },
  delete: (id) => api.delete(`/api/settlements/${id}`),
};

export const friendsAPI = {
  getAll: (groupId, page = 1, limit = 10) => {
    let url = '/api/friends';
    const params = [];
    if (groupId) params.push(`group_id=${groupId}`);
    params.push(`page=${page}`);
    params.push(`limit=${limit}`);
    if (params.length) url += '?' + params.join('&');
    return retryRequest(() => api.get(url));
  },
  add: (friendData) => api.post('/api/friends', friendData),
  update: (id, friendData) => api.put(`/api/friends/${id}`, friendData),
  delete: (id) => api.delete(`/api/friends/${id}`),
};

export const groupsAPI = {
  getAll: () => retryRequest(() => api.get('/api/groups')),
  create: (groupData) => api.post('/api/groups', groupData),
  findByCode: (code) => api.get(`/api/groups?code=${code}`),
  delete: (groupId) => api.delete(`/api/groups/${groupId}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export const authAPI = {
  login: (email, phone, password) => {
    const payload = { password };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    return api.post('/api/auth/login', payload);
  },
  register: (name, email, phone, password) => {
    const payload = { name, password };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    return api.post('/api/auth/register', payload);
  },
  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    return api.post('/api/auth/logout', { refresh_token: refreshToken });
  },
  refresh: (refreshToken) => {
    return axios.post(`${API_BASE_URL}/api/auth/refresh`, { refresh_token: refreshToken });
  },
};

export default api;