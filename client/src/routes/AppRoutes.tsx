import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
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

const AppRoutes = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const homePath = '/';

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<App portalMode="user" />} />
      {/* Login is presented as a modal in the landing App; no dedicated /login route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <App portalMode="admin" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  );
};

export default AppRoutes;
