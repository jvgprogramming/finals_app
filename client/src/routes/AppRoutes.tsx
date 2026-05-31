import { Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/Auth/LoginPage';
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
  const homePath = user?.role === 'admin' ? '/admin' : '/users';

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? homePath : '/login'} replace />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={homePath} replace /> : <LoginPage />
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="user">
            <App portalMode="user" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <App portalMode="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? homePath : '/login'} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
