import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('../features/dashboard/DashboardNew'));
const Expenses = lazy(() => import('../features/expenses/ExpensesNew'));
const Friends = lazy(() => import('../features/friends/FriendsNew'));
const Groups = lazy(() => import('../features/groups/GroupsNew'));
const DebtTracker = lazy(() => import('../pages/DebtTracker'));
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));

/**
 * AppRoutes - Central route configuration for the application
 * Uses React Router v7 structure with lazy loading
 */
function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/add-expense"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Expenses />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Expenses />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Friends />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Groups />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/debts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DebtTracker />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentHistory />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
