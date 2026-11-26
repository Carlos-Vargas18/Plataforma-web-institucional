import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  FileText,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Megaphone,
  Activity,
  Plus,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ComunicadoDto,
  PeriodoAcademicoDto,
  ResolucionDto,
  SolicitudNotaDto,
} from '../types';
import MipaTelemetriaPanel from './MipaTelemetriaPanel';
import {
  DashboardShell,
  EmptyOrLoadingState,
  KpiCard,
  SidebarNavGroup,
  StatusBanner,
} from './ui/DashboardShared';

export const RectorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'ejecutivo' | 'auditoria_notas' | 'periodos' | 'resoluciones' | 'promocion' | 'comunicados' | 'mipa'
  >('ejecutivo');

  const [resumen, setResumen] = useState<Record<string, number>>({});
  const [solicitudes, setSolicitudes] = useState<SolicitudNotaDto[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
  const [resoluciones, setResoluciones] = useState<ResolucionDto[]>([]);
  const [actasPromocion, setActasPromocion] = useState<Array<Record<string, unknown>>>([]);
  const [comunicados, setComunicados] = useState<ComunicadoDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario de nueva Resolución Rectoral
  const [resNumero, setResNumero] = useState('');
  const [resTitulo, setResTitulo] = useState('');
  const [resConsiderando, setResConsiderando] = useState('');
  const [resResuelve, setResResuelve] = useState('');

  // Formulario de Comunicado Rectoral
  const [comTitulo, setComTitulo] = useState('');
  const [comContenido, setComContenido] = useState('');
  const [comDestinatarios, setComDestinatarios] = useState('TODOS');
  const [comImportancia, setComImportancia] = useState('ALTA');

  const cargarDatosRectoria = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resData, solData, perData, resRectorData, promData, comData] = await Promise.all([
        api.getRectorResumen(),
        api.getSolicitudesCambioNota(),
        api.getPeriodosConfig(),
        api.getResolucionesRector(),
        api.getActasPromocion(),
        api.getComunicados(),
      ]);
      setResumen(resData as Record<string, number>);
      setSolicitudes(solData);
      setPeriodos(perData);
      setResoluciones(resRectorData);
      setActasPromocion(promData);
      setComunicados(comData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sincronizar datos de Rectoría.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosRectoria();
  }, [cargarDatosRectoria]);

  const handleResolverSolicitud = async (id: number, decision: 'APROBADA' | 'RECHAZADA') => {
    setError('');
    try {
      await api.resolverSolicitudCambioNota(
        id,
        decision,
        decision === 'APROBADA'
          ? 'Autorizado por Rectoría conforme al debido proceso académico Decreto 1290.'
          : 'Rechazado por falta de soporte documental.'
      );
      setSuccess(`Solicitud #${id} ${decision.toLowerCase()} exitosamente en PostgreSQL.`);
      await cargarDatosRectoria();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible procesar la solicitud.');
    }
  };

  const handleTogglePeriodo = async (periodo: PeriodoAcademicoDto) => {
    setError('');
    try {
      await api.togglePeriodoCerrado(periodo.id, !periodo.cerrado);
      setSuccess(
        `El ${periodo.nombre} ahora se encuentra ${!periodo.cerrado ? 'CERRADO (bloqueado)' : 'ABIERTO (habilitado)'} en base de datos.`
      );
      await cargarDatosRectoria();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado del periodo.');
    }
  };

  const handleCrearResolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.crearResolucionRector({
        numeroResolucion: resNumero,
        titulo: resTitulo,
        considerando: resConsiderando,
        resuelve: resResuelve,
      });
      setResNumero('');
      setResTitulo('');
      setResConsiderando('');
      setResResuelve('');
      setSuccess('Resolución Rectoral emitida y registrada en PostgreSQL.');
      await cargarDatosRectoria();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al emitir la resolución.');
    }
  };

  const handleCrearComunicado = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.crearComunicado({
        titulo: comTitulo,
        contenido: comContenido,
        destinatarioRol: comDestinatarios,
        importancia: comImportancia,
      });
      setComTitulo('');
      setComContenido('');
      setSuccess('Circular Rectoral publicada oficialmente.');
      await cargarDatosRectoria();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar comunicado.');
    }
  };

  const pendientesCount = solicitudes.filter((s) => s.estado === 'PENDIENTE').length;

  const navGroups: SidebarNavGroup[] = [
    {
      category: 'GOBIERNO ESCOLAR',
      items: [{ id: 'ejecutivo', label: 'Dashboard General', icon: <Award size={18} /> }],
    },
    {
      category: 'GESTIÓN ACADÉMICA',
      items: [
        {
          id: 'auditoria_notas',
          label: 'Auditoría de Notas',
          icon: <CheckCircle size={18} />,
          badge: pendientesCount || undefined,
          badgeTone: pendientesCount > 0 ? 'danger' : 'default',
        },
        { id: 'periodos', label: 'Cierre de Periodos', icon: <Lock size={18} /> },
        { id: 'promocion', label: 'Actas de Promoción', icon: <GraduationCap size={18} /> },
      ],
    },
    {
      category: 'NORMATIVA & ANALÍTICA',
      items: [
        { id: 'resoluciones', label: 'Resoluciones Rectorales', icon: <FileText size={18} />, badge: resoluciones.length },
        { id: 'comunicados', label: 'Circulares Oficiales', icon: <Megaphone size={18} /> },
        {
          id: 'mipa',
          label: 'Telemetría y MIPA',
          icon: <Activity size={18} />,
          badge: resumen.alertasRiesgoMipa || undefined,
          badgeTone: (resumen.alertasRiesgoMipa || 0) > 0 ? 'danger' : 'default',
        },
      ],
    },
  ];

  return (
    <DashboardShell
      portalTitle="Despacho Rectoral"
      portalSubtitle="Gobierno Escolar"
      navGroups={navGroups}
      activeTab={activeTab}
      onSelectTab={(id) => setActiveTab(id as typeof activeTab)}
      userName={user?.nombreCompleto || 'Rectoría'}
      userRoleLabel={user?.rol || 'RECTOR'}
      onLogout={logout}
      headerActions={
        <button
          type="button"
          onClick={cargarDatosRectoria}
          className="btn-secondary-action"
          style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} className={loading ? 'ec-spin' : ''} />
          <span>Sincronizar</span>
        </button>
      }
    >
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-page-title">Bienvenido, {user?.nombreCompleto}</h1>
          <p className="dashboard-page-subtitle">
            Supervisión oficial Decreto 1290, Ley 1620, resoluciones rectorales y analítica institucional en tiempo real.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setActiveTab('auditoria_notas')} className="btn-secondary-action">
            <CheckCircle size={15} /> Auditoría ({pendientesCount})
          </button>
          <button type="button" onClick={() => setActiveTab('resoluciones')} className="btn-primary-action">
            <Plus size={15} /> Nueva Resolución
          </button>
        </div>
      </div>

      <StatusBanner
        error={error}
        success={success}
        onClear={() => {
          setError('');
          setSuccess('');
        }}
      />

      {activeTab === 'ejecutivo' && (
        <>
          <div className="stats-grid">
            <KpiCard
              icon={<Users size={21} />}
              tone="blue"
              badge="Matrícula"
              badgeTone="primary"
              value={resumen.totalEstudiantes ?? 0}
              label="Estudiantes Matriculados"
              footer="Registro activo en base de datos"
            />
            <KpiCard
              icon={<Award size={21} />}
              tone="emerald"
              badge="Decreto 1290"
              badgeTone="success"
              value={`${resumen.tasaAprobacion ?? 0}%`}
              label="Índice de Aprobación"
              footer="Evaluación institucional ponderada"
            />
            <KpiCard
              icon={<FileText size={21} />}
              tone="amber"
              badge="Auditoría"
              badgeTone={pendientesCount > 0 ? 'warning' : 'neutral'}
              value={resumen.solicitudesPendientes ?? pendientesCount}
              label="Solicitudes de Nota Pendientes"
              footer="Clic para revisar en auditoría"
              onClick={() => setActiveTab('auditoria_notas')}
            />
            <KpiCard
              icon={<AlertTriangle size={21} />}
              tone="rose"
              badge="MIPA"
              badgeTone={(resumen.alertasRiesgoMipa ?? 0) > 0 ? 'danger' : 'neutral'}
              value={resumen.alertasRiesgoMipa ?? 0}
              label="Alertas MIPA Alto/Crítico"
              footer="Prevención temprana de deserción"
              onClick={() => setActiveTab('mipa')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="panel-card" style={{ marginBottom: 0 }}>
              <div className="panel-header">
                <h3>Estado Actual de Periodos Evaluativos</h3>
                <button type="button" className="btn-secondary-action" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => setActiveTab('periodos')}>
                  Gestionar Periodos
                </button>
              </div>
              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Periodo</th>
                      <th>Ponderación</th>
                      <th>Vigencia</th>
                      <th>Estado Oficial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodos.map((p) => (
                      <tr key={p.id}>
                        <td><strong style={{ color: 'var(--ec-text)' }}>{p.nombre}</strong></td>
                        <td>{p.porcentajeValor}%</td>
                        <td>{p.fechaInicio} al {p.fechaFin}</td>
                        <td>
                          <span className={`grade-badge ${p.cerrado ? 'bajo' : 'superior'}`}>
                            {p.cerrado ? 'CERRADO' : 'ABIERTO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ec-radar-dark-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>Radar de Gobierno & Alertas</span>
                  <span style={{ background: 'rgba(0,0,0,0.2)', color: '#FFFFFF', border: '1px solid rgba(0,0,0,0.35)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                    {(resumen.alertasRiesgoMipa ?? 0) + pendientesCount} pendientes
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#FFFFFF', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Resumen de acciones prioritarias detectadas directamente desde los registros institucionales.
                </p>

                <div style={{ display: 'grid', gap: '0.7rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {pendientesCount} Solicitudes de corrección de notas
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                      Pendientes de aprobación o rechazo rectoral.
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {resumen.alertasRiesgoMipa ?? 0} Alertas MIPA en nivel Alto/Crítico
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                      Estudiantes que requieren intervención preventiva.
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setActiveTab('mipa')} className="btn-primary-action" style={{ width: '100%' }}>
                Abrir Consola MIPA y Telemetría
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'auditoria_notas' && (
        <div className="panel-card">
          <div className="panel-header">
            <h3>Solicitudes Docentes de Modificación de Calificaciones</h3>
            <span className="grade-badge alto">{pendientesCount} pendientes</span>
          </div>
          {solicitudes.length === 0 ? (
            <EmptyOrLoadingState
              loading={loading}
              emptyMessage="No existen solicitudes pendientes ni históricas de cambio de nota."
            />
          ) : (
            <div className="ec-table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Docente</th>
                    <th>Estudiante / Grupo</th>
                    <th>Asignatura / Periodo</th>
                    <th>Nota Anterior</th>
                    <th>Nueva Definitiva</th>
                    <th>Justificación</th>
                    <th>Estado / Decisión</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.id}>
                      <td>{s.fecha}</td>
                      <td>{s.docente}</td>
                      <td>
                        <strong style={{ color: 'var(--ec-text)' }}>{s.estudiante}</strong>
                        <div style={{ fontSize: '0.76rem', color: 'var(--ec-text-muted)' }}>Grupo {s.grupo}</div>
                      </td>
                      <td>
                        {s.materia} ({s.periodo})
                      </td>
                      <td>{Number(s.notaAnterior).toFixed(1)}</td>
                      <td>
                        <strong style={{ color: 'var(--ec-primary)' }}>{Number(s.notaNueva).toFixed(1)}</strong>
                      </td>
                      <td style={{ maxWidth: '260px' }}>{s.motivo}</td>
                      <td>
                        {s.estado === 'PENDIENTE' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handleResolverSolicitud(s.id, 'APROBADA')}
                              className="btn-primary-action"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            >
                              <CheckCircle size={14} /> Aprobar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolverSolicitud(s.id, 'RECHAZADA')}
                              className="btn-danger-action"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                            >
                              <XCircle size={14} /> Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className={`grade-badge ${s.estado === 'APROBADA' ? 'superior' : 'bajo'}`}>
                            {s.estado}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'periodos' && (
        <div className="panel-card">
          <div className="panel-header">
            <h3>Control de Apertura y Cierre de Periodos Académicos</h3>
          </div>
          <div className="ec-table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Periodo</th>
                  <th>Porcentaje</th>
                  <th>Fecha Límite</th>
                  <th>Estado</th>
                  <th>Acción Rectoral</th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.numeroPeriodo}</td>
                    <td>
                      <strong style={{ color: 'var(--ec-text)' }}>{p.nombre}</strong>
                    </td>
                    <td>{p.porcentajeValor}%</td>
                    <td>{String(p.fechaCierreNotas).replace('T', ' ').substring(0, 16)}</td>
                    <td>
                      <span className={`grade-badge ${p.cerrado ? 'bajo' : 'superior'}`}>
                        {p.cerrado ? 'CERRADO' : 'ABIERTO'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleTogglePeriodo(p)}
                        className={p.cerrado ? 'btn-primary-action' : 'btn-danger-action'}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                      >
                        {p.cerrado ? (
                          <>
                            <Unlock size={14} /> Reabrir Periodo
                          </>
                        ) : (
                          <>
                            <Lock size={14} /> Cerrar Periodo
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'resoluciones' && (
        <>
          <div className="panel-card">
            <div className="panel-header">
              <h3>Emitir Nueva Resolución Rectoral</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleCrearResolucion} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Número de Resolución</label>
                    <input
                      type="text"
                      value={resNumero}
                      onChange={(e) => setResNumero(e.target.value)}
                      placeholder="Ej: RES-RECT-2026-002"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Título Oficial *</label>
                    <input
                      type="text"
                      required
                      value={resTitulo}
                      onChange={(e) => setResTitulo(e.target.value)}
                      placeholder="Título oficial de la resolución"
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Considerandos</label>
                  <textarea
                    rows={2}
                    value={resConsiderando}
                    onChange={(e) => setResConsiderando(e.target.value)}
                    placeholder="Considerandos legales y pedagógicos..."
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Disposición Resolutiva *</label>
                  <textarea
                    rows={3}
                    required
                    value={resResuelve}
                    onChange={(e) => setResResuelve(e.target.value)}
                    placeholder="ARTÍCULO PRIMERO: Disposición resolutiva..."
                    className="form-input"
                  />
                </div>
                <div>
                  <button type="submit" className="btn-primary-action">
                    <Plus size={16} /> Emitir y Firmar Resolución en BD
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3>Libro Oficial de Resoluciones Rectorales</h3>
            </div>
            <div className="ec-table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Título y Disposición</th>
                    <th>Emitido Por</th>
                    <th>Vigencia</th>
                  </tr>
                </thead>
                <tbody>
                  {resoluciones.map((r) => (
                    <tr key={r.id}>
                      <td><strong style={{ color: 'var(--ec-text)' }}>{r.numeroResolucion}</strong></td>
                      <td>{r.fecha}</td>
                      <td>
                        <strong style={{ color: 'var(--ec-text)' }}>{r.titulo}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--ec-text-muted)', marginTop: '4px' }}>{r.resuelve}</div>
                      </td>
                      <td>{r.emitidoPor}</td>
                      <td>
                        <span className="grade-badge superior">{r.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'promocion' && (
        <div className="panel-card">
          <div className="panel-header">
            <h3>Consolidado de Promoción Escolar y Paz y Salvo</h3>
          </div>
          <div className="ec-table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Folio Matrícula</th>
                  <th>Estudiante</th>
                  <th>Documento</th>
                  <th>Curso</th>
                  <th>Promedio Acumulado</th>
                  <th>Materias en Bajo</th>
                  <th>Estado de Promoción</th>
                </tr>
              </thead>
              <tbody>
                {actasPromocion.map((a) => (
                  <tr key={String(a.id)}>
                    <td>{String(a.folio)}</td>
                    <td>
                      <strong style={{ color: 'var(--ec-text)' }}>{String(a.estudiante)}</strong>
                    </td>
                    <td>{String(a.documento)}</td>
                    <td>{String(a.grupo)}</td>
                    <td>
                      <strong style={{ color: 'var(--ec-text)' }}>{Number(a.promedio).toFixed(2)}</strong>
                    </td>
                    <td>{String(a.materiasPerdidas)}</td>
                    <td>
                      <span
                        className={`grade-badge ${
                          a.estadoPromocion === 'PROMOVIDO' ? 'superior' : 'basico'
                        }`}
                      >
                        {String(a.estadoPromocion)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'comunicados' && (
        <>
          <div className="panel-card">
            <div className="panel-header">
              <h3>Publicar Circular o Comunicado Institucional</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={handleCrearComunicado} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Asunto del comunicado *</label>
                    <input
                      type="text"
                      required
                      value={comTitulo}
                      onChange={(e) => setComTitulo(e.target.value)}
                      placeholder="Asunto del comunicado"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Destinatarios</label>
                    <select
                      value={comDestinatarios}
                      onChange={(e) => setComDestinatarios(e.target.value)}
                      className="form-input"
                    >
                      <option value="TODOS">Toda la Comunidad</option>
                      <option value="DOCENTES">Solo Docentes</option>
                      <option value="ESTUDIANTES">Solo Estudiantes</option>
                      <option value="TUTORES">Solo Acudientes</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Prioridad</label>
                    <select
                      value={comImportancia}
                      onChange={(e) => setComImportancia(e.target.value)}
                      className="form-input"
                    >
                      <option value="NORMAL">Importancia Normal</option>
                      <option value="ALTA">Importancia Alta</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Mensaje Institucional *</label>
                  <textarea
                    rows={3}
                    required
                    value={comContenido}
                    onChange={(e) => setComContenido(e.target.value)}
                    placeholder="Redacte el mensaje institucional..."
                    className="form-input"
                  />
                </div>
                <div>
                  <button type="submit" className="btn-primary-action">
                    <Megaphone size={16} /> Publicar Comunicado
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3>Comunicados Activos en Base de Datos</h3>
            </div>
            <div className="ec-table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Título y Contenido</th>
                    <th>Destinatarios</th>
                    <th>Prioridad</th>
                    <th>Autor</th>
                  </tr>
                </thead>
                <tbody>
                  {comunicados.map((c) => (
                    <tr key={c.id}>
                      <td>{c.fecha}</td>
                      <td>
                        <strong style={{ color: 'var(--ec-text)' }}>{c.titulo}</strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '4px' }}>{c.contenido}</div>
                      </td>
                      <td>{c.destinatarioRol}</td>
                      <td>
                        <span className="grade-badge alto">{c.importancia}</span>
                      </td>
                      <td>{c.autor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'mipa' && <MipaTelemetriaPanel modo="ambos" />}
    </DashboardShell>
  );
};

export default RectorDashboard;
