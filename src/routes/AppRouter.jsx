import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import MainLayout from '../components/layout/MainLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Items Pages
import LostItems from '../pages/items/LostItems';
import FoundItems from '../pages/items/FoundItems';
import LostItemDetail from '../pages/items/LostItemDetail';
import FoundItemDetail from '../pages/items/FoundItemDetail';
import LostItemForm from '../pages/items/LostItemForm';
import FoundItemForm from '../pages/items/FoundItemForm';

// User Pages
import Dashboard from '../pages/user/Dashboard';
import Profile from '../pages/user/Profile';

// Admin Pages
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import ManageCategories from '../pages/admin/ManageCategories';
import ManageClaims from '../pages/admin/ManageClaims';
import ManageUsers from '../pages/admin/ManageUsers';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="items/lost" element={<LostItems />} />
        <Route path="items/found" element={<FoundItems />} />
        <Route path="items/lost/:id" element={<LostItemDetail />} />
        <Route path="items/found/:id" element={<FoundItemDetail />} />

        {/* User Protected Routes */}
        <Route path="dashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="items/lost/new" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <LostItemForm />
          </ProtectedRoute>
        } />
        <Route path="items/found/new" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <FoundItemForm />
          </ProtectedRoute>
        } />

        {/* Admin Protected Routes */}
        <Route path="admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        <Route path="admin/categories" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageCategories />
          </ProtectedRoute>
        } />
        <Route path="admin/claims" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageClaims />
          </ProtectedRoute>
        } />
        <Route path="admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageUsers />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
