import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const MembersPage = lazy(() => import('../pages/members/MembersPage'));
const SavingsPage = lazy(() => import('../pages/savings/SavingsPage'));
const LoansPage = lazy(() => import('../pages/loans/LoansPage'));
const AccountingPage = lazy(() => import('../pages/accounting/AccountingPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const InstitutionsPage = lazy(() => import('../pages/institutions/InstitutionsPage'));
const ApplyInstitutionPage = lazy(() => import('../pages/ApplyInstitutionPage'));

const ROLES = {
  SACCO: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN', 'SACCO_EMPLOYEE', 'MEMBER'],
  ADMIN: ['SUPER_ADMIN', 'UNION_ADMIN', 'SACCO_ADMIN'],
  UNION: ['SUPER_ADMIN', 'UNION_ADMIN'],
};

function LazyRoute({ children }) {
  return (
    <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center">Loading...</div>}>
      {children}
    </Suspense>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />,
    },
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/apply', element: <LazyRoute><ApplyInstitutionPage /></LazyRoute> },
      ],
    },
    {
      path: '/landing',
      element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <LazyRoute><LandingPage /></LazyRoute>,
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: 'dashboard', element: <LazyRoute><DashboardPage /></LazyRoute> },
        {
          path: 'members',
          element: (
            <ProtectedRoute allowedRoles={ROLES.SACCO}>
              <LazyRoute><MembersPage /></LazyRoute>
            </ProtectedRoute>
          ),
        },
        {
          path: 'savings',
          element: (
            <ProtectedRoute allowedRoles={ROLES.SACCO}>
              <LazyRoute><SavingsPage /></LazyRoute>
            </ProtectedRoute>
          ),
        },
        {
          path: 'loans',
          element: (
            <ProtectedRoute allowedRoles={ROLES.SACCO}>
              <LazyRoute><LoansPage /></LazyRoute>
            </ProtectedRoute>
          ),
        },
        {
          path: 'accounting',
          element: (
            <ProtectedRoute allowedRoles={ROLES.ADMIN}>
              <LazyRoute><AccountingPage /></LazyRoute>
            </ProtectedRoute>
          ),
        },
        {
          path: 'reports',
          element: (
            <ProtectedRoute allowedRoles={ROLES.ADMIN}>
              <LazyRoute><ReportsPage /></LazyRoute>
            </ProtectedRoute>
          ),
        },
        {
          path: 'institutions',
          element: (
            <ProtectedRoute allowedRoles={ROLES.UNION}>
              <LazyRoute><InstitutionsPage /></LazyRoute>
            </ProtectedRoute>
          ),
        },
        {
          path: 'change-password',
          element: <LazyRoute><ChangePasswordPage /></LazyRoute>,
        },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ]);

  return <RouterProvider router={router} />;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
