import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#060b14',
          color: '#f8fafc',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid rgba(59, 130, 246, 0.25)',
            borderTopColor: '#3b82f6',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600 }}>
          Verificando credenciales y permisos institucionales...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    const fallbackRoute = getHomeRouteForRole(user.rol);
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
};
