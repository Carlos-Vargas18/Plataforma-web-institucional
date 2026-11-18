import { describe, it, expect, beforeEach } from 'vitest';
import { getHomeRouteForRole } from '../context/AuthContext';
import { getStoredToken, setStoredToken, ApiClientError } from '../services/api/httpClient';
import { getSuggestionsForRole } from '../services/edubotBrain';

describe('EduConnect Frontend Core & Security Tests', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('1. getHomeRouteForRole asigna cada rol institucional a su ruta protegida oficial', () => {
    expect(getHomeRouteForRole('ADMIN')).toBe('/admin');
    expect(getHomeRouteForRole('ADMINISTRATIVO')).toBe('/admin');
    expect(getHomeRouteForRole('RECTOR')).toBe('/rector');
    expect(getHomeRouteForRole('COORDINADOR')).toBe('/coordinador');
    expect(getHomeRouteForRole('DOCENTE')).toBe('/docente');
    expect(getHomeRouteForRole('DIRECTOR_GRUPO')).toBe('/docente');
    expect(getHomeRouteForRole('ESTUDIANTE')).toBe('/estudiante');
    expect(getHomeRouteForRole('TUTOR')).toBe('/tutor');
  });

  it('2. httpClient gestiona el almacenamiento y limpieza del token JWT sin datos académicos en localStorage', () => {
    expect(getStoredToken()).toBeNull();
    setStoredToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
    expect(getStoredToken()).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test');
    setStoredToken(null);
    expect(getStoredToken()).toBeNull();
  });

  it('3. ApiClientError preserva código de estado HTTP y detalles de validación del backend', () => {
    const err = new ApiClientError('No autorizado para modificar otro estudiante', 403, {
      rol: 'ESTUDIANTE',
    });
    expect(err.status).toBe(403);
    expect(err.message).toContain('No autorizado');
    expect(err.validationErrors?.rol).toBe('ESTUDIANTE');
  });

  it('4. EduBot provee sugerencias contextualizadas según el rol institucional', () => {
    const sugerenciasAdmin = getSuggestionsForRole('ADMIN');
    expect(sugerenciasAdmin).toContain('Resumen estadístico institucional');
    expect(sugerenciasAdmin).toContain('Escala de evaluación Decreto 1290');

    const sugerenciasEstudiante = getSuggestionsForRole('ESTUDIANTE');
    expect(sugerenciasEstudiante).toContain('Escala de evaluación Decreto 1290');
    expect(sugerenciasEstudiante).not.toContain('Resumen estadístico institucional');
  });
});
