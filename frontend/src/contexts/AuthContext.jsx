import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Safe localStorage access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!initialized) return;
      
      if (token && !user) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token, initialized]); // Remove 'user' from dependencies

  const login = (newToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
    setToken(newToken);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};