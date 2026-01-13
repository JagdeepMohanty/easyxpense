import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Friends from './pages/Friends';
import CreateExpense from './pages/CreateExpense';
import Settle from './pages/Settle';
import DebtTracker from './pages/DebtTracker';
import './App.css';

// Loading component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading EasyXpense...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Auth logout listener component
const AuthLogoutListener = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, [logout, navigate]);

  return null;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="app-container">
      <AuthLogoutListener />
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute><Friends /></ProtectedRoute>
        } />
        <Route path="/create-expense" element={
          <ProtectedRoute><CreateExpense /></CreateExpense>
        } />
        <Route path="/settle" element={
          <ProtectedRoute><Settle /></ProtectedRoute>
        } />
        <Route path="/debts" element={
          <ProtectedRoute><DebtTracker /></ProtectedRoute>
        } />
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;