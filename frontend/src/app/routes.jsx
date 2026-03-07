import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const DashboardNew = lazy(() => import('../features/expenses/dashboard/DashboardNew'));
const ExpensesNew = lazy(() => import('../features/expenses/ExpensesNew'));
const AddExpense = lazy(() => import('../pages/AddExpense'));
const FriendsNew = lazy(() => import('../features/friends/FriendsNew'));
const GroupsNew = lazy(() => import('../features/groups/GroupsNew'));
const DebtTracker = lazy(() => import('../pages/DebtTracker'));
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-main">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardNew /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpensesNew /></ProtectedRoute>} />
        <Route path="/expenses/add" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><FriendsNew /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupsNew /></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><DebtTracker /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
