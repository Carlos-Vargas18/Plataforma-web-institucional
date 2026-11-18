import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getHomeRouteForRole } from '../../context/AuthContext';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import CreatixEduConnect from '../../components/CreatixEduConnect';
import AdminDashboard from '../../components/AdminDashboard';
import RectorDashboard from '../../components/RectorDashboard';
import CoordinadorDashboard from '../../components/CoordinadorDashboard';
import DocenteDashboard from '../../components/DocenteDashboard';
import EstudianteDashboard from '../../components/EstudianteDashboard';
import TutorDashboard from '../../components/TutorDashboard';
import EduBot from '../../components/EduBot';

export const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate to={getHomeRouteForRole(user.rol)} replace />
            ) : (
              <CreatixEduConnect initialView="landing" />
            )
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated && user ? (
              <Navigate to={getHomeRouteForRole(user.rol)} replace />
            ) : (
              <CreatixEduConnect initialView="plataforma" />
            )
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ADMINISTRATIVO']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rector/*"
          element={
            <ProtectedRoute allowedRoles={['RECTOR', 'ADMIN']}>
              <RectorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coordinador/*"
          element={
            <ProtectedRoute allowedRoles={['COORDINADOR', 'RECTOR', 'ADMIN']}>
              <CoordinadorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/docente/*"
          element={
            <ProtectedRoute allowedRoles={['DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'RECTOR', 'ADMIN']}>
              <DocenteDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estudiante/*"
          element={
            <ProtectedRoute allowedRoles={['ESTUDIANTE']}>
              <EstudianteDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/*"
          element={
            <ProtectedRoute allowedRoles={['TUTOR']}>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated && user ? (
              <Navigate to={getHomeRouteForRole(user.rol)} replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      {isAuthenticated && user && <EduBot userRole={user.rol} userName={user.nombreCompleto} />}
    </>
  );
};
