import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, phone, password) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const payload = { password };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
    const { access_token, refresh_token, token: legacyToken, user: newUser } = response.data;

    const accessToken = access_token || legacyToken;
    setToken(accessToken);
    setRefreshToken(refresh_token);
    setUser(newUser);
    localStorage.setItem('token', accessToken);
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return response.data;
  };

  const register = async (name, email, phone, password) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const payload = { name, password };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
    const { access_token, refresh_token, token: legacyToken, user: newUser } = response.data;

    const accessToken = access_token || legacyToken;
    setToken(accessToken);
    setRefreshToken(refresh_token);
    setUser(newUser);
    localStorage.setItem('token', accessToken);
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    return response.data;
  };

  const logout = async () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    try {
      if (refreshToken) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, { refresh_token: refreshToken });
      }
    } catch (error) {
      // Ignore logout errors
    }
    
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshAccessToken = async () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refresh_token: refreshToken
    });
    
    const { access_token, refresh_token: newRefreshToken, token: legacyToken } = response.data;
    const accessToken = access_token || legacyToken;
    
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('token', accessToken);
    if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    return accessToken;
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    register,
    logout,
    refreshAccessToken,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
