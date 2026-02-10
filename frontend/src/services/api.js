import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s for Render cold starts
});

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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
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
  getAll: (groupId) => {
    const url = groupId ? `/api/expenses?group_id=${groupId}` : '/api/expenses';
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
  getHistory: (groupId) => {
    const url = groupId ? `/api/settlements?group_id=${groupId}` : '/api/settlements';
    return retryRequest(() => api.get(url));
  },
  delete: (id) => api.delete(`/api/settlements/${id}`),
};

export const friendsAPI = {
  getAll: (groupId) => {
    const url = groupId ? `/api/friends?group_id=${groupId}` : '/api/friends';
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

export default api;