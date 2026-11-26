import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AsistenciaDto,
  CalificacionDto,
  ComunicadoDto,
  HorarioBloqueDto,
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
  Award,
  Calendar,
  CheckCircle,
  Printer,
  FileText,
  Megaphone,
  FileSignature,
  BookOpen,
} from 'lucide-react';

export const EstudianteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'calificaciones' | 'horario' | 'observador' | 'comunicados'>('calificaciones');

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [calificaciones, setCalificaciones] = useState<CalificacionDto[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaDto[]>([]);
  const [horarios, setHorarios] = useState<HorarioBloqueDto[]>([]);
  const [observaciones, setObservaciones] = useState<ObservacionDto[]>([]);
  const [comunicados, setComunicados] = useState<ComunicadoDto[]>([]);
  const [showBoletinModal, setShowBoletinModal] = useState(false);

  const cargarDatosEstudiante = useCallback(async () => {
    setLoading(true);
    try {
      const [calData, asisData, horData, obsData, comData] = await Promise.all([
        api.getCalificacionesEstudiante(user?.estudianteId),
        api.getAsistenciasEstudiante(user?.estudianteId),
        api.getHorarios(user?.grupoAsignado),
        api.getObservaciones(user?.estudianteId),
        api.getComunicados(),
      ]);
      setCalificaciones(calData);
      setAsistencias(asisData);
      setHorarios(horData);
      setObservaciones(obsData);
      setComunicados(comData);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No fue posible cargar tu información académica.',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.estudianteId, user?.grupoAsignado]);

  useEffect(() => {
    void cargarDatosEstudiante();
  }, [cargarDatosEstudiante]);

  const handleFirmarObservacion = async (id: number) => {
    try {
      const actualizada = await api.firmarObservacion(id);
      setObservaciones((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
      setStatusMessage({
        type: 'success',
        text: 'Anotación del observador firmada digitalmente por el estudiante.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al firmar la observación.',
      });
    }
  };

  const average =
    calificaciones.length > 0
      ? (calificaciones.reduce((acc, c) => acc + c.notaDefinitivaPeriodo, 0) / calificaciones.length).toFixed(2)
      : '0.00';

  const totalFallas = asistencias.filter((a) => a.estado === 'AUSENTE' && !a.justificada).length;
  const porcentajeAsistencia =
    asistencias.length > 0
      ? Math.round(((asistencias.length - totalFallas) / asistencias.length) * 100)
      : 100;

  const navGroups: SidebarNavGroup[] = [
    {
      category: 'MI APRENDIZAJE',
      items: [
        { id: 'calificaciones', label: 'Mis Calificaciones', icon: <Award size={18} />, badge: calificaciones.length || undefined },
        { id: 'horario', label: 'Mi Horario de Clases', icon: <Calendar size={18} /> },
      ],
    },
    {
      category: 'SEGUIMIENTO & COMUNICACIÓN',
      items: [
        { id: 'observador', label: 'Observador & Asistencia', icon: <CheckCircle size={18} />, badge: observaciones.length || undefined },
        { id: 'comunicados', label: 'Circulares Institucionales', icon: <Megaphone size={18} />, badge: comunicados.length || undefined },
      ],
    },
  ];

  return (
    <DashboardShell
      portalTitle="Campus Estudiantes"
      portalSubtitle={`Grupo ${user?.grupoAsignado || '10-A'}`}
      navGroups={navGroups}
      activeTab={currentTab}
      onSelectTab={(id) => setCurrentTab(id as typeof currentTab)}
      userName={user?.nombreCompleto || 'Estudiante'}
      userRoleLabel="ESTUDIANTE"
      userSubLabel={user?.grupoAsignado}
      onLogout={logout}
      headerActions={
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => setShowBoletinModal(true)}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <FileText size={15} />
          <span>Boletín Oficial</span>
        </button>
      }
    >
      {/* HERO WELCOME BANNER STITCH */}
      <div className="ec-hero-banner no-print">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.16)', padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 700, marginBottom: '0.55rem' }}>
            <span>Grupo {user?.grupoAsignado || '10-A'}</span>
            <span>·</span>
            <span>Año Lectivo 2026</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
            ¡Hola de nuevo, {user?.primerNombre || user?.nombreCompleto}!
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.88)' }}>
            Tu promedio acumulado actual es <strong>{average} / 5.0</strong> con <strong>{porcentajeAsistencia}%</strong> de asistencia.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCurrentTab('horario')}
            style={{
                  background: 'var(--ec-surface-card)',
              color: 'var(--ec-primary-dark)',
              padding: '0.58rem 1rem',
              borderRadius: '11px',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Calendar size={15} /> Ver mi horario
          </button>
          <button
            type="button"
            onClick={() => setShowBoletinModal(true)}
            style={{
              background: 'rgba(255,255,255,0.16)',
              color: 'var(--ec-text)',
              border: '1px solid var(--ec-border)',
              padding: '0.58rem 1rem',
              borderRadius: '11px',
              fontWeight: 600,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={15} /> Boletín Decreto 1290
          </button>
        </div>
      </div>

      {statusMessage && (
        <StatusBanner
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* METRICS */}
      <div className="stats-grid no-print">
        <KpiCard
          icon={<Award size={20} />}
          tone="blue"
          badge="Escala MEN"
          badgeTone="primary"
          value={`${average} / 5.0`}
          label="Promedio Acumulado"
        />
        <KpiCard
          icon={<CheckCircle size={20} />}
          tone="emerald"
          badge={`${totalFallas} fallas`}
          badgeTone="success"
          value={`${porcentajeAsistencia}%`}
          label="Cumplimiento de Asistencia"
        />
        <KpiCard
          icon={<BookOpen size={20} />}
          tone="indigo"
          badge="Periodo"
          value={calificaciones.length}
          label="Asignaturas Evaluadas"
        />
        <KpiCard
          icon={<FileSignature size={20} />}
          tone="amber"
          badge="Convivencia"
          value={observaciones.length}
          label="Anotaciones en Observador"
          onClick={() => setCurrentTab('observador')}
        />
      </div>

      {loading ? (
        <EmptyOrLoadingState loading={true} message="Cargando tu expediente estudiantil desde el servidor..." />
      ) : (
        <>
          {/* TAB 1: CALIFICACIONES */}
          {currentTab === 'calificaciones' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Calificaciones del Periodo Actual</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Ponderación SIEE Decreto 1290: Saber/Cognitivo (40%) + Hacer/Procedimental (30%) + Ser/Actitudinal (30%)
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

              {calificaciones.length === 0 ? (
                <EmptyOrLoadingState loading={false} message="Aún no tienes calificaciones registradas en este periodo." />
              ) : (
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
                      {calificaciones.map((c) => (
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
              )}
            </div>
          )}

          {/* TAB 2: HORARIO DE CLASES */}
          {currentTab === 'horario' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Horario Semanal de Clases</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Grupo: <strong>{user?.grupoAsignado || '10-A'}</strong>
                  </p>
                </div>
                <span className="grade-badge superior">Horario Oficial</span>
              </div>

              <div className="panel-body">
                <HorarioSemanalGrid bloques={horarios} editable={false} />
              </div>
            </div>
          )}

          {/* TAB 3: OBSERVADOR & ASISTENCIA */}
          {currentTab === 'observador' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Mi Observador y Registro de Asistencia</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Historial formativo y compromisos académicos
                  </p>
                </div>
                <span className="grade-badge superior">Asistencia: {porcentajeAsistencia}%</span>
              </div>

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {observaciones.length === 0 ? (
                  <EmptyOrLoadingState emptyMessage="No tienes anotaciones registradas en el observador estudiantil." />
                ) : (
                  observaciones.map((obs) => (
                    <div
                      key={obs.id}
                      style={{
                        background: 'var(--ec-surface-low)',
                        padding: '1.15rem 1.25rem',
                        borderRadius: '14px',
                        border: '1px solid var(--ec-border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className={`grade-badge ${obs.tipo === 'FELICITACION' ? 'superior' : 'alto'}`}>
                          {obs.tipo}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--ec-text-muted)', fontWeight: 600 }}>
                          {obs.fecha} — {obs.autor}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ec-text)', marginBottom: '0.6rem', lineHeight: 1.5 }}>{obs.descripcion}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <div style={{ fontSize: '0.83rem', color: 'var(--ec-primary-dark)' }}>
                          <strong>Compromiso:</strong> {obs.compromisos}
                        </div>
                        {obs.firmadoEstudiante ? (
                          <span className="grade-badge superior">Firmado por Estudiante</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFirmarObservacion(obs.id)}
                            className="btn-primary-action"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            Firmar Compromiso
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COMUNICADOS */}
          {currentTab === 'comunicados' && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Circulares y Comunicados Institucionales</h3>
              </div>
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {comunicados.length === 0 ? (
                  <EmptyOrLoadingState emptyMessage="No hay comunicados publicados en este momento." />
                ) : (
                  comunicados.map((com) => (
                    <div
                      key={com.id}
                      style={{
                        background: 'var(--ec-surface-low)',
                        border: '1px solid var(--ec-border)',
                        borderRadius: '14px',
                        padding: '1.1rem 1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--ec-text)' }}>{com.titulo}</strong>
                        <span className="grade-badge alto">{com.fecha}</span>
                      </div>
                      <p style={{ color: 'var(--ec-text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>{com.contenido}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL BOLETÍN OFICIAL DECRETO 1290 */}
      <BoletinOficialModal
        isOpen={showBoletinModal}
        onClose={() => setShowBoletinModal(false)}
        estudianteId={user?.estudianteId}
        estudianteNombre={user?.nombreCompleto || 'Estudiante'}
        estudianteDocumento={user?.documento}
        grupo={user?.grupoAsignado || '10-A'}
        periodo="Primer Periodo 2026"
        inasistenciasTotales={totalFallas}
        calificaciones={calificaciones.map((c) => ({
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
    </DashboardShell>
  );
};

export default EstudianteDashboard;
