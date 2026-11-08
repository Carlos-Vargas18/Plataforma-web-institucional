import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { CreatixEduConnect } from './components/CreatixEduConnect';
import { AdminDashboard } from './components/AdminDashboard';
import { RectorDashboard } from './components/RectorDashboard';
import { CoordinadorDashboard } from './components/CoordinadorDashboard';
import { DocenteDashboard } from './components/DocenteDashboard';
import { EstudianteDashboard } from './components/EstudianteDashboard';
import { TutorDashboard } from './components/TutorDashboard';
import { EduBot } from './components/EduBot';
import { LogOut, Globe, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeRoleOverride, setActiveRoleOverride] = useState<'ADMIN' | 'RECTOR' | 'COORDINADOR' | 'DIRECTOR_GRUPO' | 'DOCENTE' | 'ESTUDIANTE' | 'TUTOR' | null>(null);
  const [showLandingOverride, setShowLandingOverride] = useState<boolean>(false);

  useEffect(() => {
    // Auditoría automática de telemetría de accesos a la Web
    api.registrarIngresoTelemetria(
      'web',
      user?.rol || 'VISITANTE',
      user?.email || 'publico@educonnect.com',
      user?.nombreCompleto || 'Visitante Web'
    ).catch(() => {});
  }, [user]);

  // Si no está autenticado, mostramos la experiencia visual Creatix
  if (!isAuthenticated || !user) {
    return (
      <>
        <CreatixEduConnect
          onDirectRoleSelect={(role) => {
            setActiveRoleOverride(role);
          }}
        />
        <EduBot />
      </>
    );
  }

  // Rol activo (permite al usuario alternar entre cualquiera de los 7 dashboards con 1 solo clic)
  const currentRole = activeRoleOverride || user.rol;

  if (showLandingOverride) {
    return (
      <>
        {/* Barra superior de retorno */}
        <div className="role-switcher-bar">
          <div className="role-switcher-left">
            <span className="role-tag-badge">
              <CheckCircle size={13} />
              <span>Supabase Conectado</span>
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              Sesión activa: <strong style={{ color: 'white' }}>{user.nombreCompleto}</strong> ({user.rol})
            </span>
          </div>
          <div className="role-chips-group">
            <button className="role-chip active" onClick={() => setShowLandingOverride(false)}>
              <span>← Volver al Dashboard Activo ({currentRole})</span>
            </button>
            <button className="role-chip" onClick={logout}>
              <LogOut size={13} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
        <CreatixEduConnect />
        <EduBot />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* BARRA SUPERIOR DE SELECTOR RÁPIDO DE DASHBOARDS (TODOS LOS 7 ROLES INSTITUCIONALES) */}
      <header className="role-switcher-bar">
        <div className="role-switcher-left">
          <span className="role-tag-badge">
            <CheckCircle size={13} />
            <span>Supabase Conectado</span>
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
            Panel Activo: <strong style={{ color: '#38bdf8' }}>{currentRole}</strong> | Cuenta: <span style={{ color: 'white' }}>{user.email}</span>
          </span>
        </div>

        <div className="role-chips-group">
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginRight: '0.25rem' }}>Cambiar de Panel:</span>
          <button
            className={`role-chip ${currentRole === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setActiveRoleOverride('ADMIN')}
          >
            👑 Admin
          </button>
          <button
            className={`role-chip ${currentRole === 'RECTOR' ? 'active' : ''}`}
            onClick={() => setActiveRoleOverride('RECTOR')}
          >
            🏛️ Rector
          </button>
          <button
            className={`role-chip ${currentRole === 'COORDINADOR' ? 'active' : ''}`}
            onClick={() => setActiveRoleOverride('COORDINADOR')}
          >
            📋 Coordinador
          </button>
          <button
            className={`role-chip ${currentRole === 'DOCENTE' || currentRole === 'DIRECTOR_GRUPO' ? 'active' : ''}`}
            onClick={() => setActiveRoleOverride('DOCENTE')}
          >
            👨‍🏫 Docente
          </button>
          <button
            className={`role-chip ${currentRole === 'ESTUDIANTE' ? 'active' : ''}`}
            onClick={() => setActiveRoleOverride('ESTUDIANTE')}
          >
            👨‍🎓 Estudiante
          </button>
          <button
            className={`role-chip ${currentRole === 'TUTOR' ? 'active' : ''}`}
            onClick={() => setActiveRoleOverride('TUTOR')}
          >
            👨‍👦 Tutor
          </button>

          <button
            className="role-chip"
            style={{ background: 'rgba(255, 255, 255, 0.04)', marginLeft: '0.5rem' }}
            onClick={() => setShowLandingOverride(true)}
            title="Ver el sitio web institucional"
          >
            <Globe size={13} />
            <span>Ver Portal Web</span>
          </button>

          <button
            className="role-chip"
            style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.2)' }}
            onClick={logout}
          >
            <LogOut size={13} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* RENDERIZADO DEL DASHBOARD SELECCIONADO */}
      <div style={{ flex: 1 }}>
        {currentRole === 'ADMIN' && <AdminDashboard />}
        {currentRole === 'RECTOR' && <RectorDashboard />}
        {currentRole === 'COORDINADOR' && <CoordinadorDashboard />}
        {(currentRole === 'DOCENTE' || currentRole === 'DIRECTOR_GRUPO') && <DocenteDashboard />}
        {currentRole === 'ESTUDIANTE' && <EstudianteDashboard />}
        {currentRole === 'TUTOR' && <TutorDashboard />}
      </div>

      {/* ASISTENTE INSTITUCIONAL FLOTANTE EDUBOT */}
      <EduBot />
    </div>
  );
};
