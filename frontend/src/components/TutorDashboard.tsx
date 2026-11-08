import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { HijoTutor, HorarioClase, BoletinEstudiante } from '../types';
import { HorarioSemanalGrid } from './HorarioSemanalGrid';
import { BoletinOficialModal } from './BoletinOficialModal';
import {
  GraduationCap,
  LogOut,
  HeartPulse,
  ShieldCheck,
  Phone,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  Award,
  CheckCircle,
  Send,
  Download,
  User,
  Users,
  Printer
} from 'lucide-react';

export const TutorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'informe' | 'horario' | 'custodia' | 'convivencia' | 'justificaciones'>('informe');
  const [hijos, setHijos] = useState<HijoTutor[]>([]);
  const [selectedHijoIndex, setSelectedHijoIndex] = useState<number>(0);
  const [horarios, setHorarios] = useState<HorarioClase[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario justificación inasistencia
  const [fechaInasistencia, setFechaInasistencia] = useState('');
  const [motivoInasistencia, setMotivoInasistencia] = useState('');
  const [soporteAdjunto, setSoporteAdjunto] = useState('');

  const notify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  useEffect(() => {
    api.getHijosTutor().then((data) => {
      setHijos(data);
    });
    api.getHorarios().then(setHorarios);
  }, []);

  const hijoActual = hijos[selectedHijoIndex] || null;

  const handleEnviarJustificacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInasistencia || !motivoInasistencia.trim()) {
      alert('Por favor complete la fecha y el motivo de la inasistencia');
      return;
    }
    notify(`✅ Excusa radicada formalmente ante la Coordinación para ${hijoActual?.nombreCompleto}.`);
    setFechaInasistencia('');
    setMotivoInasistencia('');
    setSoporteAdjunto('');
  };

  const handleConfirmarCitacion = (citId: number) => {
    notify('🤝 Asistencia confirmada. La institución ha recibido tu respuesta.');
  };

  // Boletín Oficial Modal (Decreto 1290)
  const [selectedBoletin, setSelectedBoletin] = useState<BoletinEstudiante | null>(null);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  const handleVerBoletinOficial = async () => {
    if (!hijoActual) return;
    const b = await api.getBoletinEstudiante(hijoActual.codigo, 1);
    setSelectedBoletin(b);
    setShowBoletinModal(true);
  };

  const handleImprimirBoletin = () => {
    window.print();
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.2rem' }}>EduConnect</div>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>Portal de Acudientes</span>
            </div>
          </div>
        </div>

        {/* SELECTOR DE HIJO VINCULADO */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-dark)' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
            Hijo(s) a Cargo en el Colegio:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {hijos.map((h, idx) => (
              <button
                key={h.id}
                onClick={() => setSelectedHijoIndex(idx)}
                style={{
                  background: selectedHijoIndex === idx ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedHijoIndex === idx ? '1px solid #f59e0b' : '1px solid var(--border-dark)',
                  color: selectedHijoIndex === idx ? '#fbbf24' : '#cbd5e1',
                  borderRadius: '10px',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedHijoIndex === idx ? '#f59e0b' : '#334155', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                  {h.nombreCompleto.charAt(0)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {h.nombreCompleto}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{h.grado}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${currentTab === 'informe' ? 'active' : ''}`}
            onClick={() => setCurrentTab('informe')}
          >
            <FileText size={20} />
            <span>Boletín de Notas</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'horario' ? 'active' : ''}`}
            onClick={() => setCurrentTab('horario')}
          >
            <Calendar size={20} />
            <span>Horario de Clases</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'custodia' ? 'active' : ''}`}
            onClick={() => setCurrentTab('custodia')}
          >
            <ShieldCheck size={20} />
            <span>Ficha Médica & Portería</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'convivencia' ? 'active' : ''}`}
            onClick={() => setCurrentTab('convivencia')}
          >
            <AlertCircle size={20} />
            <span>Observador & Citaciones</span>
          </li>
          <li
            className={`sidebar-item ${currentTab === 'justificaciones' ? 'active' : ''}`}
            onClick={() => setCurrentTab('justificaciones')}
          >
            <Send size={20} />
            <span>Excusas / Inasistencias</span>
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
              {currentTab === 'informe' && 'Boletín e Informe Académico Oficial'}
              {currentTab === 'horario' && `Horario de Clases — ${hijoActual?.nombreCompleto || 'Estudiante'}`}
              {currentTab === 'custodia' && 'Ficha de Custodia, Médica y Protocolo de Salida'}
              {currentTab === 'convivencia' && 'Seguimiento Convivencial y Citaciones a Padres'}
              {currentTab === 'justificaciones' && 'Radicación de Justificativos de Inasistencia'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Acudiente: {user?.nombreCompleto || 'Juan Fernando Ramírez'} — Seguimiento Institucional 2026
            </p>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar-circle" style={{ background: '#fef3c7', color: '#b45309' }}>
              👨‍👦
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.nombreCompleto}</div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>ACUDIENTE REGISTRADO</div>
            </div>
          </div>
        </div>

        {successMsg && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.9rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
            <CheckCircle size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TARJETA DE HIJO ACTIVO */}
        {hijoActual && (
          <div className="panel-card" style={{ borderLeft: '5px solid #f59e0b', marginBottom: '1.5rem' }}>
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {hijoActual.nombreCompleto.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{hijoActual.nombreCompleto}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Código: <strong>{hijoActual.codigo}</strong> | Curso: <strong>{hijoActual.grado}</strong> | Director de Grupo: <strong>{hijoActual.directorGrupo}</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="grade-badge superior">Asistencia: {hijoActual.asistenciaPorcentaje}%</span>
                <span className="grade-badge alto">Puesto en Curso: #{hijoActual.puestoEnCurso}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: BOLETÍN DE CALIFICACIONES E INFORME OFICIAL */}
        {currentTab === 'informe' && hijoActual && (
          <div className="panel-card" style={{ width: '100%' }}>
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>📑 Calificaciones del Periodo 1 — Año Lectivo 2026</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ponderación Institucional Oficial: Cognitivo (40%) + Procedimental (40%) + Actitudinal (20%)
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
                  onClick={handleImprimirBoletin}
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
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
                    <th style={{ width: '10%', textAlign: 'center' }}>Definitiva</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Desempeño</th>
                  </tr>
                </thead>
                <tbody>
                  {hijoActual.calificaciones.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{c.materia}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.docente}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.cognitivo.toFixed(1)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.procedimental.toFixed(1)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.actitudinal.toFixed(1)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`grade-badge ${c.desempeno === 'SUPERIOR' ? 'superior' : c.desempeno === 'ALTO' ? 'alto' : 'basico'}`}>
                          {c.definitiva.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.desempeno}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', fontWeight: 700 }}>
                    <td colSpan={5} style={{ textAlign: 'right', padding: '0.9rem 1rem', color: '#e2e8f0', letterSpacing: '0.02em' }}>PROMEDIO GENERAL DEL ESTUDIANTE:</td>
                    <td style={{ textAlign: 'center', color: '#38bdf8', fontSize: '1.15rem', fontWeight: 800 }}>{hijoActual.promedioGeneral.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}><span className="grade-badge superior">SUPERIOR</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: HORARIO DE CLASES DEL HIJO (EN RECUADROS) */}
        {currentTab === 'horario' && hijoActual && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📅 Horario Semanal de Clases (En Recuadros)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Grado: <strong>{hijoActual.grado}</strong> — Asignaturas de {hijoActual.nombreCompleto}
                </p>
              </div>
              <span className="grade-badge superior">Jornada Mañana (07:00 AM - 01:30 PM)</span>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <HorarioSemanalGrid
                horarios={horarios.filter(h => h.grupoNombre.toLowerCase().includes(hijoActual.grado.toLowerCase().substring(0, 2)))}
                readOnly={true}
              />
            </div>
          </div>
        )}

        {/* TAB 3: FICHA DE CUSTODIA, MÉDICA Y SALIDA */}
        {currentTab === 'custodia' && hijoActual && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* FICHA MÉDICA */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185' }}>
                  <HeartPulse size={20} /> Ficha Médica y Primeros Auxilios
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <strong>Tipo de Sangre (RH):</strong> <span className="grade-badge" style={{ background: '#ffe4e6', color: '#e11d48', fontWeight: 800 }}>{hijoActual.tipoSangreRh}</span>
                </p>
                <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <strong>EPS / Seguro Estudiantil:</strong> <span style={{ color: 'white', fontWeight: 600 }}>{hijoActual.eps}</span>
                </p>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>Alergias o Condiciones Especiales:</strong><br />
                  {hijoActual.alergias}
                </p>
                <div style={{ background: 'rgba(251, 113, 133, 0.08)', padding: '0.9rem', borderRadius: '10px', border: '1px solid rgba(251, 113, 133, 0.25)', fontSize: '0.8rem', color: '#fda4af' }}>
                  🏥 En caso de emergencia, la enfermería escolar aplicará protocolo de atención inmediata y notificará a los números autorizados.
                </div>
              </div>
            </div>

            {/* PROTOCOLO DE SALIDA / PORTERÍA */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                  <ShieldCheck size={20} /> Protocolo de Portería y Retiro
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  <strong>Persona Autorizada:</strong><br />
                  <span style={{ color: 'white', fontWeight: 700 }}>{hijoActual.autorizadoRetiro}</span>
                </p>
                <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                  <strong>Teléfono de Seguridad:</strong> <span style={{ color: '#38bdf8' }}>+57 300 5556677</span>
                </p>
                <span className="grade-badge superior" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
                  ✓ Carnet Digital de Acudiente Activo
                </span>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Ninguna persona ajena al registro institucional podrá retirar al menor sin previo consentimiento escrito y validación de documento de identidad.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONVIVENCIA, OBSERVADOR Y CITACIONES */}
        {currentTab === 'convivencia' && hijoActual && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>📋 Observador del Estudiante y Citaciones</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Registro pedagógico y reuniones de acompañamiento escolar
                </p>
              </div>
            </div>

            {/* CITACIONES */}
            {hijoActual.citaciones.length > 0 && (
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dark)', background: 'rgba(245, 158, 11, 0.05)' }}>
                <h4 style={{ color: '#f59e0b', marginBottom: '0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} /> Citaciones Oficiales de Acudientes
                </h4>
                {hijoActual.citaciones.map((cit) => (
                  <div key={cit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white' }}>{cit.motivo}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Fecha: <strong>{cit.fechaHora}</strong> | Convoca: {cit.docente}
                      </div>
                    </div>
                    <button
                      onClick={() => handleConfirmarCitacion(cit.id)}
                      className="btn-primary-action"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    >
                      Confirmar Asistencia
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* OBSERVACIONES */}
            <div style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>
                Anotaciones en Observador Institucional
              </h4>
              {hijoActual.observaciones.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>El estudiante no presenta observaciones disciplinarias ni llamados de atención.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {hijoActual.observaciones.map((obs, idx) => (
                    <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className={`grade-badge ${obs.tipo === 'FELICITACION' ? 'superior' : 'alto'}`}>
                          {obs.tipo}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{obs.fecha} — {obs.docente}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>{obs.descripcion}</p>
                      <div style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
                        <strong>Compromiso Acordado:</strong> {obs.compromiso}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: RADICACIÓN DE EXCUSAS / JUSTIFICATIVOS */}
        {currentTab === 'justificaciones' && hijoActual && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>✉️ Radicación de Excusa o Justificación de Inasistencia</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Notificar incapacidad médica o calamidad familiar a la Coordinación Académica
                </p>
              </div>
            </div>

            <form onSubmit={handleEnviarJustificacion} style={{ padding: '1.75rem', maxWidth: '650px' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Estudiante a Justificar
                </label>
                <input
                  type="text"
                  disabled
                  className="form-input"
                  value={`${hijoActual.nombreCompleto} (${hijoActual.grado})`}
                  style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Fecha de la Inasistencia *
                </label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={fechaInasistencia}
                  onChange={(e) => setFechaInasistencia(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Motivo de la Falta (Incapacidad médica, calamidad doméstica, etc.) *
                </label>
                <textarea
                  rows={4}
                  required
                  className="form-input"
                  placeholder="Explique detalladamente la causa de la inasistencia..."
                  value={motivoInasistencia}
                  onChange={(e) => setMotivoInasistencia(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                  Certificado Médico / Soporte EPS (Opcional - Enlace o Referencia)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Número de incapacidad EPS o enlace al certificado médico..."
                  value={soporteAdjunto}
                  onChange={(e) => setSoporteAdjunto(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary-action"
                style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <Send size={16} />
                <span>Radicar Excusa Institucional</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* MODAL BOLETÍN OFICIAL DE CALIFICACIONES (DECRETO 1290) */}
      {showBoletinModal && selectedBoletin && (
        <BoletinOficialModal
          boletin={selectedBoletin}
          onClose={() => setShowBoletinModal(false)}
        />
      )}
    </div>
  );
};
