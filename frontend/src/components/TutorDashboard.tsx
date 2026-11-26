import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AsistenciaDto,
  CalificacionDto,
  CitacionDto,
  HorarioBloqueDto,
  JustificacionDto,
  ObservacionDto,
} from '../types';
import HorarioSemanalGrid from './HorarioSemanalGrid';
import BoletinOficialModal from './BoletinOficialModal';
import {
  DashboardShell,
  EmptyOrLoadingState,
  KpiCard,
  SidebarNavGroup,
  StatusBanner,
} from './ui/DashboardShared';
import {
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Send,
  Printer,
  CheckCircle,
  Award,
  Clock,
} from 'lucide-react';

interface AcudidoTutorItem {
  estudianteId: number;
  matriculaId: number;
  folioMatricula: string;
  nombreCompleto: string;
  documento: string;
  codigoEstudiantil: string;
  grupo: string;
  parentesco: string;
  pazYSalvo: boolean;
  promedioGeneral: number;
  calificaciones: CalificacionDto[];
  asistencias: AsistenciaDto[];
}

export const TutorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'informe' | 'horario' | 'custodia' | 'convivencia' | 'justificaciones'>('informe');

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [hijos, setHijos] = useState<AcudidoTutorItem[]>([]);
  const [selectedHijoIndex, setSelectedHijoIndex] = useState<number>(0);
  const [horarios, setHorarios] = useState<HorarioBloqueDto[]>([]);
  const [citaciones, setCitaciones] = useState<CitacionDto[]>([]);
  const [observaciones, setObservaciones] = useState<ObservacionDto[]>([]);
  const [justificaciones, setJustificaciones] = useState<JustificacionDto[]>([]);

  // Formulario justificación inasistencia
  const [asistenciaIdJustificar, setAsistenciaIdJustificar] = useState<string>('');
  const [motivoInasistencia, setMotivoInasistencia] = useState('');
  const [soporteAdjunto, setSoporteAdjunto] = useState('');

  // Boletín Oficial Modal (Decreto 1290)
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  const cargarDatosTutor = useCallback(async () => {
    setLoading(true);
    try {
      const [acudidosData, horData, citData, justData] = await Promise.all([
        api.getAcudidosTutor(),
        api.getHorarios(),
        api.getCitaciones(),
        api.getJustificaciones(),
      ]);
      setHijos(acudidosData);
      setHorarios(horData);
      setCitaciones(citData);
      setJustificaciones(justData);

      if (acudidosData.length > 0) {
        const obsData = await api.getObservaciones(acudidosData[0].estudianteId);
        setObservaciones(obsData);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al sincronizar el portal de acudientes.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatosTutor();
  }, [cargarDatosTutor]);

  const hijoActual = hijos[selectedHijoIndex] || null;

  const handleSeleccionarHijo = async (idx: number) => {
    setSelectedHijoIndex(idx);
    const target = hijos[idx];
    if (target) {
      try {
        const obsData = await api.getObservaciones(target.estudianteId);
        setObservaciones(obsData);
      } catch {
        // Ignorar error parcial
      }
    }
  };

  const handleEnviarJustificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hijoActual || !motivoInasistencia.trim()) return;
    try {
      const creada = await api.crearJustificacion({
        estudianteId: hijoActual.estudianteId,
        asistenciaId: asistenciaIdJustificar ? Number(asistenciaIdJustificar) : undefined,
        motivo: motivoInasistencia.trim(),
        soporte: soporteAdjunto.trim() || 'Soporte radicado en portal de acudientes',
      });
      setJustificaciones((prev) => [creada, ...prev]);
      setMotivoInasistencia('');
      setSoporteAdjunto('');
      setAsistenciaIdJustificar('');
      setStatusMessage({
        type: 'success',
        text: `Excusa radicada formalmente ante Coordinación para ${hijoActual.nombreCompleto}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No fue posible radicar la justificación.',
      });
    }
  };

  const handleConfirmarCitacion = async (citId: number) => {
    try {
      const actualizada = await api.actualizarEstadoCitacion(
        citId,
        'CONFIRMADA',
        'Asistencia confirmada digitalmente por el acudiente desde el portal.'
      );
      setCitaciones((prev) => prev.map((c) => (c.id === citId ? actualizada : c)));
      setStatusMessage({
        type: 'success',
        text: 'Comparecencia confirmada exitosamente ante la institución.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al confirmar la citación.',
      });
    }
  };

  const handleFirmarObservacion = async (obsId: number) => {
    try {
      const actualizada = await api.firmarObservacion(obsId);
      setObservaciones((prev) => prev.map((o) => (o.id === obsId ? actualizada : o)));
      setStatusMessage({
        type: 'success',
        text: 'Observación firmada digitalmente por el acudiente.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al firmar la observación.',
      });
    }
  };

  const inasistenciasHijo = hijoActual
    ? hijoActual.asistencias.filter((a) => a.estado === 'AUSENTE' || a.estado === 'TARDE')
    : [];

  const navGroups: SidebarNavGroup[] = [
    {
      category: 'SEGUIMIENTO FAMILIAR',
      items: [
        { id: 'informe', label: 'Boletín de Notas', icon: <FileText size={18} /> },
        { id: 'horario', label: 'Horario de Clases', icon: <Calendar size={18} /> },
      ],
    },
    {
      category: 'BIENESTAR & TRÁMITES',
      items: [
        { id: 'custodia', label: 'Matrícula & Paz y Salvo', icon: <ShieldCheck size={18} /> },
        { id: 'convivencia', label: 'Observador & Citaciones', icon: <AlertCircle size={18} />, badge: citaciones.length || undefined },
        { id: 'justificaciones', label: 'Excusas / Inasistencias', icon: <Send size={18} />, badge: inasistenciasHijo.length || undefined },
      ],
    },
  ];

  return (
    <DashboardShell
      portalTitle="Portal de Acudientes"
      portalSubtitle="Seguimiento Familiar"
      navGroups={navGroups}
      activeTab={currentTab}
      onSelectTab={(id) => setCurrentTab(id as typeof currentTab)}
      userName={user?.nombreCompleto || 'Acudiente'}
      userRoleLabel="TUTOR / ACUDIENTE"
      userSubLabel={hijoActual ? `Acudido: ${hijoActual.grupo}` : undefined}
      onLogout={logout}
      headerActions={
        hijoActual && (
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setShowBoletinModal(true)}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          >
            <FileText size={15} />
            <span>Boletín Oficial</span>
          </button>
        )
      }
      sidebarExtra={
        hijos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#FFFFFF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Acudido Activo
            </div>
            {hijos.map((h, idx) => (
              <button
                key={h.estudianteId}
                type="button"
                onClick={() => void handleSeleccionarHijo(idx)}
                style={{
                  background: selectedHijoIndex === idx ? '#FFFFFF' : '#000000',
                  border: '1px solid #FFFFFF',
                  color: selectedHijoIndex === idx ? '#000000' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '0.45rem 0.65rem',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nombreCompleto}</div>
                <div style={{ fontSize: '0.68rem', color: 'inherit' }}>Grupo {h.grupo}</div>
              </button>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="dashboard-topbar no-print">
        <div>
          <h1 className="dashboard-page-title">Hola, {user?.primerNombre || user?.nombreCompleto}</h1>
          <p className="dashboard-page-subtitle">
            Tutor Principal · Seguimiento académico, matrícula, convivencia y excusas de tus acudidos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary-action" onClick={() => setCurrentTab('justificaciones')}>
            <Send size={15} /> Radicar Excusa
          </button>
          {hijoActual && (
            <button type="button" className="btn-primary-action" onClick={() => setShowBoletinModal(true)}>
              <FileText size={15} /> Ver Boletín Oficial
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <StatusBanner
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {loading ? (
        <EmptyOrLoadingState loading={true} message="Cargando información de tus acudidos..." />
      ) : !hijoActual ? (
        <EmptyOrLoadingState loading={false} message="No se encontraron estudiantes vinculados a esta cuenta de acudiente." />
      ) : (
        <>
          {/* SELECTOR HORIZONTAL DE ACUDIDOS (ESTILO MOBILE/DESKTOP STITCH) */}
          <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {hijos.map((h, idx) => {
              const isSelected = selectedHijoIndex === idx;
              return (
                <button
                  key={h.estudianteId}
                  type="button"
                  onClick={() => void handleSeleccionarHijo(idx)}
                  style={{
                    background: isSelected ? 'var(--ec-primary-gradient)' : 'var(--ec-surface-card)',
                    color: isSelected ? '#FFFFFF' : 'var(--ec-text)',
                    border: `1px solid ${isSelected ? 'var(--ec-primary)' : 'var(--ec-border)'}`,
                    borderRadius: '14px',
                    padding: '0.65rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    boxShadow: isSelected ? 'var(--ec-shadow-primary)' : 'var(--ec-shadow-xs)',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--ec-primary-soft)',
                      color: isSelected ? '#FFFFFF' : 'var(--ec-primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    {h.nombreCompleto.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{h.nombreCompleto}</div>
                    <div style={{ fontSize: '0.74rem', opacity: isSelected ? 0.9 : 0.7 }}>
                      Grupo {h.grupo} · Prom: {h.promedioGeneral.toFixed(2)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* KPIs DEL ACUDIDO ACTIVO */}
          <div className="stats-grid no-print">
            <KpiCard
              icon={<Award size={20} />}
              tone="blue"
              badge="Decreto 1290"
              badgeTone="primary"
              value={hijoActual.promedioGeneral.toFixed(2)}
              label="Promedio General"
              footer={`Código: ${hijoActual.codigoEstudiantil}`}
            />
            <KpiCard
              icon={<ShieldCheck size={20} />}
              tone={hijoActual.pazYSalvo ? 'emerald' : 'rose'}
              badge={hijoActual.pazYSalvo ? 'Al Día' : 'Pendiente'}
              badgeTone={hijoActual.pazYSalvo ? 'success' : 'danger'}
              value={hijoActual.pazYSalvo ? 'Paz y Salvo' : 'Por Revisar'}
              label="Estado Financiero / Matrícula"
              footer={`Folio: ${hijoActual.folioMatricula}`}
            />
            <KpiCard
              icon={<Clock size={20} />}
              tone="amber"
              badge={hijoActual.grupo}
              value={inasistenciasHijo.length}
              label="Fallas / Retardos"
              onClick={() => setCurrentTab('justificaciones')}
            />
            <KpiCard
              icon={<AlertCircle size={20} />}
              tone="indigo"
              badge={hijoActual.parentesco}
              value={citaciones.length}
              label="Citaciones Registradas"
              onClick={() => setCurrentTab('convivencia')}
            />
          </div>

          {/* TAB 1: BOLETÍN DE CALIFICACIONES */}
          {currentTab === 'informe' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Calificaciones del Periodo Actual — {hijoActual.nombreCompleto}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Ponderación Institucional SIEE (Decreto 1290): Saber (40%) + Hacer (30%) + Ser (30%)
                  </p>
                </div>

                <div className="no-print" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={() => setShowBoletinModal(true)}
                  >
                    <FileText size={15} />
                    <span>Ver Boletín Oficial</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary-action"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asignatura</th>
                      <th>Docente Titular</th>
                      <th style={{ textAlign: 'center' }}>Saber (40%)</th>
                      <th style={{ textAlign: 'center' }}>Hacer (30%)</th>
                      <th style={{ textAlign: 'center' }}>Ser (30%)</th>
                      <th style={{ textAlign: 'center' }}>Definitiva</th>
                      <th style={{ textAlign: 'center' }}>Desempeño</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hijoActual.calificaciones.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{c.materia}</td>
                        <td style={{ color: 'var(--ec-text-muted)' }}>{c.docente}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.notaCognitiva.toFixed(1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.notaProcedimental.toFixed(1)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.notaActitudinal.toFixed(1)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`grade-badge ${
                              c.escalaDesempeno === 'SUPERIOR'
                                ? 'superior'
                                : c.escalaDesempeno === 'ALTO'
                                ? 'alto'
                                : c.escalaDesempeno === 'BASICO'
                                ? 'basico'
                                : 'bajo'
                            }`}
                          >
                            {c.notaDefinitivaPeriodo.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ec-text)' }}>{c.escalaDesempeno}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HORARIO DE CLASES DEL HIJO */}
          {currentTab === 'horario' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Horario Semanal de Clases</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Grupo: <strong>{hijoActual.grupo}</strong> — {hijoActual.nombreCompleto}
                  </p>
                </div>
                <span className="grade-badge superior">Horario Oficial</span>
              </div>

              <div className="panel-body">
                <HorarioSemanalGrid
                  bloques={horarios.filter((h) => h.grupo.toLowerCase().includes(hijoActual.grupo.toLowerCase()))}
                  editable={false}
                />
              </div>
            </div>
          )}

          {/* TAB 3: CUSTODIA Y ESTADO DE MATRÍCULA */}
          {currentTab === 'custodia' && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Ficha de Matrícula, Custodia y Paz y Salvo</h3>
              </div>
              <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'var(--ec-surface-low)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--ec-border)' }}>
                  <h4 style={{ color: 'var(--ec-primary-dark)', marginBottom: '0.8rem', fontSize: '1rem' }}>Datos Oficiales de Matrícula</h4>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <div><strong>Folio SIMAT:</strong> {hijoActual.folioMatricula}</div>
                    <div><strong>Documento:</strong> {hijoActual.documento}</div>
                    <div><strong>Código Estudiantil:</strong> {hijoActual.codigoEstudiantil}</div>
                    <div>
                      <strong>Paz y Salvo Financiero:</strong>{' '}
                      <span className={`grade-badge ${hijoActual.pazYSalvo ? 'superior' : 'bajo'}`}>
                        {hijoActual.pazYSalvo ? 'Al Día' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'var(--ec-surface-low)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--ec-border)' }}>
                  <h4 style={{ color: 'var(--ec-success)', marginBottom: '0.8rem', fontSize: '1rem' }}>Responsable Legal y Retiro</h4>
                  <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.88rem' }}>
                    <div><strong>Acudiente Principal:</strong> {user?.nombreCompleto}</div>
                    <div><strong>Parentesco Registrado:</strong> {hijoActual.parentesco}</div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      El retiro anticipado del estudiante en portería requiere presentación del documento de identidad del acudiente autorizado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONVIVENCIA, OBSERVADOR Y CITACIONES */}
          {currentTab === 'convivencia' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Observador del Estudiante y Citaciones a Padres</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Confirmación de comparecencia y firma digital de compromisos pedagógicos
                  </p>
                </div>
              </div>

              {/* CITACIONES */}
              <div className="panel-body" style={{ borderBottom: '1px solid var(--ec-border)' }}>
                <h4 style={{ color: 'var(--ec-warning)', marginBottom: '0.85rem', fontSize: '0.98rem' }}>
                  Citaciones Oficiales Registradas
                </h4>
                {citaciones.length === 0 ? (
                  <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.88rem' }}>No tienes citaciones pendientes en este momento.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {citaciones.map((cit) => (
                      <div
                        key={cit.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.85rem',
                          background: 'var(--ec-warning-bg)',
                          padding: '1rem 1.15rem',
                          borderRadius: '14px',
                          border: '1px solid var(--ec-warning-border)',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{cit.motivo}</div>
                          <div style={{ fontSize: '0.83rem', color: 'var(--ec-text-secondary)', marginTop: '0.2rem' }}>
                            Fecha: <strong>{cit.fecha} {cit.hora}</strong> · Lugar: {cit.lugar} · Convoca: {cit.convocadoPor}
                          </div>
                        </div>
                        {cit.estado === 'CONFIRMADA' || cit.estado === 'REALIZADA' ? (
                          <span className="grade-badge superior">
                            <CheckCircle size={13} />
                            {cit.estado}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleConfirmarCitacion(cit.id)}
                            className="btn-primary-action"
                            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
                          >
                            Confirmar Asistencia
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OBSERVACIONES */}
              <div className="panel-body">
                <h4 style={{ color: 'var(--ec-text)', marginBottom: '0.85rem', fontSize: '0.98rem' }}>
                  Anotaciones en Observador Institucional
                </h4>
                {observaciones.length === 0 ? (
                  <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.88rem' }}>
                    El estudiante no presenta observaciones pendientes.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {observaciones.map((obs) => (
                      <div
                        key={obs.id}
                        style={{
                          background: 'var(--ec-surface-low)',
                          padding: '1.15rem 1.25rem',
                          borderRadius: '14px',
                          border: '1px solid var(--ec-border)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span className={`grade-badge ${obs.tipo === 'FELICITACION' ? 'superior' : 'alto'}`}>
                            {obs.tipo}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>
                            {obs.fecha} — {obs.autor}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ec-text)', marginBottom: '0.6rem', lineHeight: 1.5 }}>{obs.descripcion}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                          <div style={{ fontSize: '0.83rem', color: 'var(--ec-primary-dark)' }}>
                            <strong>Compromiso Acordado:</strong> {obs.compromisos}
                          </div>
                          {obs.firmadoAcudiente ? (
                            <span className="grade-badge superior">Firmado por Acudiente</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleFirmarObservacion(obs.id)}
                              className="btn-primary-action"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                            >
                              Firmar como Acudiente
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: RADICACIÓN DE EXCUSAS / JUSTIFICATIVOS */}
          {currentTab === 'justificaciones' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Radicación de Excusa o Justificación de Inasistencia</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Notificar incapacidad médica o calamidad familiar a Coordinación Académica
                  </p>
                </div>
              </div>

              <div className="panel-body">
                <form onSubmit={handleEnviarJustificacion} style={{ maxWidth: '680px', marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Registro de Inasistencia o Retardo a Justificar</label>
                    <select
                      className="form-input"
                      value={asistenciaIdJustificar}
                      onChange={(e) => setAsistenciaIdJustificar(e.target.value)}
                    >
                      <option value="">Seleccionar última inasistencia registrada (automático)</option>
                      {inasistenciasHijo.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fecha} — {a.materia} ({a.estado})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Motivo de la Inasistencia (Incapacidad médica, calamidad doméstica) *</label>
                    <textarea
                      rows={4}
                      required
                      className="form-input"
                      placeholder="Explique detalladamente la causa de la inasistencia..."
                      value={motivoInasistencia}
                      onChange={(e) => setMotivoInasistencia(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Referencia de Soporte / Incapacidad EPS</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Número de incapacidad médica o entidad emisora..."
                      value={soporteAdjunto}
                      onChange={(e) => setSoporteAdjunto(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary-action" style={{ padding: '0.7rem 1.4rem' }}>
                    <Send size={15} />
                    <span>Radicar Excusa en Servidor</span>
                  </button>
                </form>

                {justificaciones.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.75rem', color: 'var(--ec-text)' }}>Historial de Excusas Radicadas</h4>
                    <div className="ec-table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Fecha Falta</th>
                            <th>Asignatura</th>
                            <th>Motivo</th>
                            <th>Estado Revisión</th>
                          </tr>
                        </thead>
                        <tbody>
                          {justificaciones.map((j) => (
                            <tr key={j.id}>
                              <td>{j.fechaInasistencia}</td>
                              <td>{j.materia}</td>
                              <td>{j.motivo}</td>
                              <td>
                                <span
                                  className={`grade-badge ${
                                    j.estado === 'APROBADA_COORDINACION'
                                      ? 'superior'
                                      : j.estado === 'RECHAZADA'
                                      ? 'bajo'
                                      : 'basico'
                                  }`}
                                >
                                  {j.estado.replace(/_/g, ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL BOLETÍN OFICIAL DE CALIFICACIONES (DECRETO 1290) */}
      {hijoActual && (
        <BoletinOficialModal
          isOpen={showBoletinModal}
          onClose={() => setShowBoletinModal(false)}
          estudianteId={hijoActual.estudianteId}
          estudianteNombre={hijoActual.nombreCompleto}
          estudianteDocumento={hijoActual.documento}
          estudianteCodigo={hijoActual.codigoEstudiantil}
          grupo={hijoActual.grupo}
          periodo="Primer Periodo 2026"
          calificaciones={hijoActual.calificaciones.map((c) => ({
            id: c.id,
            materia: c.materia,
            area: c.area,
            docente: c.docente,
            intensidadHoraria: c.intensidadHoraria,
            nota1: c.notaCognitiva,
            nota2: c.notaProcedimental,
            nota3: c.notaActitudinal,
            notaFinal: c.notaDefinitivaPeriodo,
            observaciones: c.juicioValorativo,
          }))}
        />
      )}
    </DashboardShell>
  );
};

export default TutorDashboard;
