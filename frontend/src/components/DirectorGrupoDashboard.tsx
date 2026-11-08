import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AlumnoGrupoDetalle } from '../types';
import {
  Users,
  Award,
  HeartPulse,
  ShieldCheck,
  Phone,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  LogOut,
  Search,
  Plus
} from 'lucide-react';

export const DirectorGrupoDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'directorio' | 'observador' | 'consolidado'>('directorio');
  const [alumnos, setAlumnos] = useState<AlumnoGrupoDetalle[]>([]);
  const [filtro, setFiltro] = useState('');
  const [observacionModal, setObservacionModal] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<AlumnoGrupoDetalle | null>(null);
  const [notaObservacion, setNotaObservacion] = useState('');

  useEffect(() => {
    api.getAlumnosDirectorGrupo().then(setAlumnos);
  }, []);

  const alumnosFiltrados = alumnos.filter(a =>
    a.nombreCompleto.toLowerCase().includes(filtro.toLowerCase()) ||
    a.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  const promedioGeneralGrupo = alumnos.length > 0
    ? (alumnos.reduce((acc, a) => acc + a.promedioAcumulado, 0) / alumnos.length).toFixed(2)
    : '4.35';

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR DIRECTOR DE GRUPO */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Users size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>Director de Grupo</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${currentTab === 'directorio' ? 'active' : ''}`}
            onClick={() => setCurrentTab('directorio')}
          >
            <Users size={20} />
            <span>Directorio & Custodia</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'observador' ? 'active' : ''}`}
            onClick={() => setCurrentTab('observador')}
          >
            <AlertCircle size={20} />
            <span>Observador del Curso</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'consolidado' ? 'active' : ''}`}
            onClick={() => setCurrentTab('consolidado')}
          >
            <FileSpreadsheet size={20} />
            <span>Consolidado Académico</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-content">
        <div className="dashboard-topbar">
          <div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>Dirección de Curso — Grado 6°A</h1>
            <p style={{ color: 'var(--text-light-muted)', fontSize: '0.95rem' }}>
              Director Asignado: <strong>{user?.nombreCompleto || 'Prof. Jeider Antonio'}</strong> — Aula 201 Bloque B (Jornada Mañana)
            </p>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar-circle" style={{ background: '#10b981', color: 'white' }}>
              👥
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user?.nombreCompleto || 'Director de Curso'}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>TUTORÍA GRUPO 6°A</div>
            </div>
          </div>
        </div>

        {/* MÉTRICAS DEL GRUPO */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon indigo"><Users size={24} /></div>
            <div>
              <div className="stat-number">{alumnos.length}</div>
              <div className="stat-label">Estudiantes a Cargo</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><Award size={24} /></div>
            <div>
              <div className="stat-number">{promedioGeneralGrupo}</div>
              <div className="stat-label">Promedio General del Curso</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber"><ShieldCheck size={24} /></div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Acudientes y Tutores al Día</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rose"><HeartPulse size={24} /></div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Fichas Médicas (RH / EPS)</div>
            </div>
          </div>
        </div>

        {/* TAB 1: DIRECTORIO Y CUSTODIA */}
        {currentTab === 'directorio' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📋 Directorio de Estudiantes, Tutores y Protocolo de Retiro</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  Información de contacto urgente, parentesco y datos médicos para emergencias institucionales.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Buscar estudiante por nombre o código..."
                  className="form-input"
                  style={{ width: '280px' }}
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Estudiante</th>
                  <th>Acudiente / Tutor Principal</th>
                  <th>Teléfono Emergencia</th>
                  <th>Ficha Médica (RH / EPS)</th>
                  <th>Custodia y Retiro</th>
                </tr>
              </thead>
              <tbody>
                {alumnosFiltrados.map((a) => (
                  <tr key={a.id}>
                    <td><code>{a.codigo}</code></td>
                    <td style={{ fontWeight: 700, color: 'white' }}>{a.nombreCompleto}</td>
                    <td>
                      <div>{a.acudientePrincipal}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Parentesco: {a.parentesco}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa' }}>
                        <Phone size={14} />
                        <code>{a.telefonoEmergencia}</code>
                      </div>
                    </td>
                    <td>
                      <span className="grade-badge alto" style={{ marginRight: '0.4rem' }}>{a.tipoSangreRh}</span>
                      <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{a.eps}</span>
                    </td>
                    <td>
                      <span className="grade-badge superior">
                        ✓ Autorizado en Portería
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: OBSERVADOR DEL CURSO */}
        {currentTab === 'observador' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📖 Observador de Convivencia y Mérito del Grupo 6°A</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  Seguimiento formativo individualizado y acuerdos pedagógicos.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(34, 197, 94, 0.08)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#4ade80' }}>🌟 Felicitación Académica y Convivencial</strong>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>26 de Febrero 2026</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  <strong>Estudiante:</strong> Carlos Vargas (EST-2026-030)
                </p>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Destacada participación como monitor de clase en Lengua Castellana y apoyo a compañeros con dificultades de comprensión lectora.
                </p>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#fbbf24' }}>⚠️ Compromiso de Puntualidad</strong>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>24 de Febrero 2026</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  <strong>Estudiante:</strong> Sofía Isabel Castro (EST-2026-041)
                </p>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Se dialogó con la acudiente (Patricia Castro) respecto a dos llegadas tarde en la semana. Se firma acuerdo de ingreso puntual a las 06:45 AM.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONSOLIDADO ACADÉMICO */}
        {currentTab === 'consolidado' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📊 Consolidado General de Calificaciones (Periodo 1 - 2026)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light-muted)' }}>
                  Matriz unificada de todas las asignaturas para el Comité de Evaluación y Promoción.
                </p>
              </div>
              <span className="grade-badge superior">Año Lectivo 2026</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Estudiante</th>
                  <th>Español (40/40/20)</th>
                  <th>Matemáticas</th>
                  <th>Ciencias</th>
                  <th>Inglés</th>
                  <th>Promedio Periodo</th>
                  <th>Desempeño</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="grade-badge superior">1°</span></td>
                  <td style={{ fontWeight: 700, color: 'white' }}>Carlos Vargas</td>
                  <td>4.72</td>
                  <td>4.60</td>
                  <td>4.80</td>
                  <td>4.75</td>
                  <td style={{ fontWeight: 800, color: '#4ade80' }}>4.72</td>
                  <td><span className="grade-badge superior">SUPERIOR</span></td>
                </tr>
                <tr>
                  <td><span className="grade-badge superior">2°</span></td>
                  <td style={{ fontWeight: 700, color: 'white' }}>Lucas Mateo Ramírez</td>
                  <td>4.70</td>
                  <td>4.80</td>
                  <td>4.50</td>
                  <td>4.60</td>
                  <td style={{ fontWeight: 800, color: '#4ade80' }}>4.65</td>
                  <td><span className="grade-badge superior">SUPERIOR</span></td>
                </tr>
                <tr>
                  <td><span className="grade-badge alto">3°</span></td>
                  <td style={{ fontWeight: 700, color: 'white' }}>Mariana Duque</td>
                  <td>4.18</td>
                  <td>4.20</td>
                  <td>4.10</td>
                  <td>4.25</td>
                  <td style={{ fontWeight: 800, color: '#60a5fa' }}>4.18</td>
                  <td><span className="grade-badge alto">ALTO</span></td>
                </tr>
                <tr>
                  <td><span className="grade-badge basico">4°</span></td>
                  <td style={{ fontWeight: 700, color: 'white' }}>Sofía Isabel Castro</td>
                  <td>3.80</td>
                  <td>3.70</td>
                  <td>4.00</td>
                  <td>3.90</td>
                  <td style={{ fontWeight: 800, color: '#fbbf24' }}>3.85</td>
                  <td><span className="grade-badge basico">BASICO</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
