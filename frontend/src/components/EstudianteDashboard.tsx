import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calificacion, HorarioClase, BoletinEstudiante } from '../types';
import { HorarioSemanalGrid } from './HorarioSemanalGrid';
import { BoletinOficialModal } from './BoletinOficialModal';
import {
  GraduationCap,
  LogOut,
  Award,
  HeartPulse,
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Printer,
  FileText
} from 'lucide-react';

export const EstudianteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'calificaciones' | 'horario' | 'observador'>('calificaciones');
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);

  // Boletín Oficial (Decreto 1290)
  const [selectedBoletin, setSelectedBoletin] = useState<BoletinEstudiante | null>(null);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  const handleVerBoletinOficial = async () => {
    const b = await api.getBoletinEstudiante('EST-2026-001', 1);
    setSelectedBoletin(b);
    setShowBoletinModal(true);
  };

  const handleImprimir = () => {
    window.print();
  };

  useEffect(() => {
    if (user?.id) {
      api.getCalificacionesEstudiante(user.id).then((data) => {
        if (data && data.length > 0) {
          setCalificaciones(data);
        } else {
          setCalificaciones([
            { id: 1, materiaNombre: 'Matemáticas y Álgebra', docenteNombre: 'Prof. Roberto Silva', notaCognitiva: 4.8, notaProcedimental: 4.5, notaActitudinal: 5.0, notaDefinitivaPeriodo: 4.70, desempeno: 'SUPERIOR' },
            { id: 2, materiaNombre: 'Lengua Castellana y Literatura', docenteNombre: 'Lic. Elena Gómez', notaCognitiva: 4.6, notaProcedimental: 4.7, notaActitudinal: 5.0, notaDefinitivaPeriodo: 4.72, desempeno: 'SUPERIOR' },
            { id: 3, materiaNombre: 'Ciencias Naturales y Química', docenteNombre: 'Lic. Claudia Morales', notaCognitiva: 4.5, notaProcedimental: 4.6, notaActitudinal: 4.8, notaDefinitivaPeriodo: 4.60, desempeno: 'SUPERIOR' },
            { id: 4, materiaNombre: 'Educación Física y Deportes', docenteNombre: 'Lic. Marcos Rivas', notaCognitiva: 5.0, notaProcedimental: 5.0, notaActitudinal: 5.0, notaDefinitivaPeriodo: 5.00, desempeno: 'SUPERIOR' },
            { id: 5, materiaNombre: 'Inglés Comunicativo', docenteNombre: 'Lic. Sandra Vargas', notaCognitiva: 4.2, notaProcedimental: 4.4, notaActitudinal: 4.6, notaDefinitivaPeriodo: 4.36, desempeno: 'ALTO' },
          ]);
        }
      });
    }

    api.getHorarios().then(setHorarios);
  }, [user]);

  const average = calificaciones.length > 0
    ? (calificaciones.reduce((acc, c) => acc + c.notaDefinitivaPeriodo, 0) / calificaciones.length).toFixed(2)
    : '4.68';

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Portal Estudiantil</span>
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${currentTab === 'calificaciones' ? 'active' : ''}`}
            onClick={() => setCurrentTab('calificaciones')}
          >
            <Award size={20} />
            <span>Mis Calificaciones</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'horario' ? 'active' : ''}`}
            onClick={() => setCurrentTab('horario')}
          >
            <Calendar size={20} />
            <span>Mi Horario de Clases</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'observador' ? 'active' : ''}`}
            onClick={() => setCurrentTab('observador')}
          >
            <CheckCircle size={20} />
            <span>Observador & Asistencia</span>
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
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.2rem' }}>
              {currentTab === 'calificaciones' && 'Boletín Académico Personal'}
              {currentTab === 'horario' && 'Horario Semanal de Clases'}
              {currentTab === 'observador' && 'Seguimiento Convivencial y Asistencia'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Estudiante: {user?.nombreCompleto || 'Carlos Vargas'} — Grado: 6°A Secundaria (Año Lectivo 2026)
            </p>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar-circle" style={{ background: '#e0e7ff', color: '#4338ca' }}>
              👨‍🎓
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.nombreCompleto}</div>
              <div style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 700 }}>ESTUDIANTE ACTIVO</div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon indigo"><Award size={24} /></div>
            <div>
              <div className="stat-number">{average}</div>
              <div className="stat-label">Promedio Acumulado (0-5.0)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><UserCheck size={24} /></div>
            <div>
              <div className="stat-number">Juan Fernando Ramírez</div>
              <div className="stat-label">Tutor / Acudiente Vinculado</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rose"><HeartPulse size={24} /></div>
            <div>
              <div className="stat-number">O+ (Sanitas EPS)</div>
              <div className="stat-label">Ficha Médica y Seguro Estudiantil</div>
            </div>
          </div>
        </div>

        {/* TAB 1: CALIFICACIONES */}
        {currentTab === 'calificaciones' && (
          <div className="panel-card" style={{ width: '100%' }}>
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>📑 Calificaciones del Periodo Actual</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Evaluación continua: Cognitivo (40%) + Procedimental (40%) + Actitudinal (20%)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={handleVerBoletinOficial}
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
                >
                  <FileText size={16} />
                  <span>Ver Boletín Oficial (Decreto 1290)</span>
                </button>

                <button
                  type="button"
                  onClick={handleImprimir}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-dark)', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Printer size={16} />
                  <span>Imprimir Calificaciones</span>
                </button>
              </div>
            </div>

            <div style={{ width: '100%', overflowX: 'visible', padding: '0 0.5rem 0.5rem' }}>
              <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Asignatura</th>
                    <th style={{ width: '22%' }}>Docente Titular</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Cognitivo<br/><span style={{ fontSize: '0.72rem', opacity: 0.8 }}>(40%)</span></th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Procedimental<br/><span style={{ fontSize: '0.72rem', opacity: 0.8 }}>(40%)</span></th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actitudinal<br/><span style={{ fontSize: '0.72rem', opacity: 0.8 }}>(20%)</span></th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Nota Final</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Desempeño</th>
                  </tr>
                </thead>
                <tbody>
                  {calificaciones.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{c.materiaNombre}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.docenteNombre}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.notaCognitiva?.toFixed(1) || '4.5'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.notaProcedimental?.toFixed(1) || '4.6'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.notaActitudinal?.toFixed(1) || '5.0'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`grade-badge ${
                            c.desempeno === 'SUPERIOR' ? 'superior' : c.desempeno === 'ALTO' ? 'alto' : c.desempeno === 'BASICO' ? 'basico' : 'bajo'
                          }`}
                        >
                          {c.notaDefinitivaPeriodo.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.desempeno}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: HORARIO DE CLASES (EN RECUADROS) */}
        {currentTab === 'horario' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📅 Horario Semanal de Clases (En Recuadros)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Grado: <strong>6°A Secundaria</strong> — Salón 201 Bloque A
                </p>
              </div>
              <span className="grade-badge superior">Jornada Mañana (07:00 AM - 01:30 PM)</span>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <HorarioSemanalGrid horarios={horarios} readOnly={true} />
            </div>
          </div>
        )}

        {/* TAB 3: OBSERVADOR & ASISTENCIA */}
        {currentTab === 'observador' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📋 Mi Observador y Registro Convivencial</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Historial de seguimiento formativo y porcentaje de asistencia
                </p>
              </div>
              <span className="grade-badge superior">Asistencia: 98% al día</span>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="grade-badge superior">FELICITACIÓN</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2026-02-20 — Prof. Roberto Silva</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>
                  Demostró excelente desempeño en la resolución de problemas de pensamiento lógico y colaboración activa con sus compañeros de equipo.
                </p>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
                  <strong>Compromiso:</strong> Continuar participando en el semillero de ciencias exactas.
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="grade-badge alto">FORMATIVA</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2026-02-10 — Lic. Elena Gómez</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>
                  Entrega puntual del primer informe del proyecto de comprensión lectora.
                </p>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
                  <strong>Compromiso:</strong> Mantener el hábito de lectura diaria.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL BOLETÍN OFICIAL DECRETO 1290 */}
      {showBoletinModal && selectedBoletin && (
        <BoletinOficialModal
          boletin={selectedBoletin}
          onClose={() => setShowBoletinModal(false)}
        />
      )}
    </div>
  );
};
