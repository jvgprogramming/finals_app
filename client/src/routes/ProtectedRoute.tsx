import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
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
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate to={user?.role === 'admin' ? '/admin' : '/users'} replace />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
