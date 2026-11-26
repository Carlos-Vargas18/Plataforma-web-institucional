import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../../context/AuthContext';
import { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user, profileUnavailable, refreshProfile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        role="status"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ec-bg)',
          color: 'var(--ec-text)',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'currentColor',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--ec-text)', fontSize: '0.95rem', fontWeight: 600 }}>
          Verificando credenciales y permisos institucionales...
        </p>
      </div>
    );
  }

  if (profileUnavailable) {
    return (
      <main className="panel-card" style={{ maxWidth: '30rem', margin: '3rem auto', padding: '1.25rem' }}>
        <p role="status">No pudimos verificar tu sesión. Comprueba tu conexión e inténtalo de nuevo.</p>
        <button type="button" className="btn-primary-action" onClick={() => void refreshProfile()}>
          Reintentar
        </button>
      </main>
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
