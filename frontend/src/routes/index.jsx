import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ProtectedRoute from '../components/ProtectedRoute';

// Eager load critical pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Lazy load heavy pages
const Dashboard = lazy(() => import('../pages/DashboardNew'));
const Expenses = lazy(() => import('../pages/ExpensesNew'));
const Friends = lazy(() => import('../pages/FriendsNew'));
const Groups = lazy(() => import('../pages/GroupsNew'));
const DebtTracker = lazy(() => import('../pages/DebtTracker'));
const PaymentHistory = lazy(() => import('../pages/PaymentHistory'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with lazy loading */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Expenses />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Friends />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <Groups />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/debts"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <DebtTracker />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoader />}>
                <PaymentHistory />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
