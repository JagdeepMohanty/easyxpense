import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, phone, password) => {
    const response = await authAPI.login(email, phone, password);
    const { token: accessToken, user: newUser } = response.data;

    setToken(accessToken);
    setUser(newUser);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    return response.data;
  };

  const register = async (name, email, phone, password) => {
    const response = await authAPI.register(name, email, phone, password);
    const { token: accessToken, user: newUser } = response.data;

    setToken(accessToken);
    setUser(newUser);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    return response.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
