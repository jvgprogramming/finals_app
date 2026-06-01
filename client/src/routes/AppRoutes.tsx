import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerApp from '../pages/Customer/CustomerApp';
import AdminApp from '../pages/Admin/AdminApp';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

const LoadingScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-alabaster)',
      flexDirection: 'column',
      gap: '16px',
    }}
  >
    <div className="spinner spinner-lg" />
    <p
      style={{
        color: 'var(--color-cocoa)',
        fontSize: '14px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      Restoring your session…
    </p>
  </div>
);

/** Send authenticated admins to /admin instead of the customer landing page. */
const CustomerHome = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <CustomerApp />;
};

const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<CustomerHome />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminApp />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
