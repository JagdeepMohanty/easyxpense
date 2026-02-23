import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const DashboardNew = lazy(() => import('../pages/DashboardNew'));
const ExpensesNew = lazy(() => import('../pages/ExpensesNew'));
const AddExpense = lazy(() => import('../pages/AddExpense'));
const FriendsNew = lazy(() => import('../pages/FriendsNew'));
const GroupsNew = lazy(() => import('../pages/GroupsNew'));
const DebtTracker = lazy(() => import('../pages/DebtTracker'));
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpensesNew /></ProtectedRoute>} />
        <Route path="/expenses/add" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsNew /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupsNew /></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><DebtTracker /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
