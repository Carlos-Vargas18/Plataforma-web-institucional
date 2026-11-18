import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CalificacionDto,
  CasoConvivenciaDto,
  CitacionDto,
  ComunicadoDto,
  GrupoDto,
  HorarioBloqueDto,
  JustificacionDto,
  ObservacionDto,
} from '../types';
import HorarioSemanalGrid from './HorarioSemanalGrid';
import BoletinOficialModal from './BoletinOficialModal';
import MipaTelemetriaPanel from './MipaTelemetriaPanel';
import {
  DashboardShell,
  EmptyOrLoadingState,
  KpiCard,
  SidebarNavGroup,
  StatusBanner,
} from './ui/DashboardShared';
import {
  AlertTriangle,
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  Award,
  FileText,
  Activity,
  Megaphone,
  FileCheck,
} from 'lucide-react';

export const CoordinadorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<
    'convivencia' | 'citaciones' | 'justificaciones' | 'auditoria' | 'horarios' | 'observador' | 'comunicados' | 'mipa'
  >('convivencia');

  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [grupos, setGrupos] = useState<GrupoDto[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionDto[]>([]);
  const [casos, setCasos] = useState<CasoConvivenciaDto[]>([]);
  const [citaciones, setCitaciones] = useState<CitacionDto[]>([]);
  const [justificaciones, setJustificaciones] = useState<JustificacionDto[]>([]);
  const [horarios, setHorarios] = useState<HorarioBloqueDto[]>([]);
  const [observaciones, setObservaciones] = useState<ObservacionDto[]>([]);
  const [comunicados, setComunicados] = useState<ComunicadoDto[]>([]);

  const [horarioGrupoFilter, setHorarioGrupoFilter] = useState('10-A');

  // Modales y formularios
  const [nuevoCasoModal, setNuevoCasoModal] = useState(false);
  const [estudianteCaso, setEstudianteCaso] = useState('');
  const [tipoFalta, setTipoFalta] = useState<'TIPO_I' | 'TIPO_II' | 'TIPO_III'>('TIPO_I');
  const [severidadCaso, setSeveridadCaso] = useState<'LEVE' | 'GRAVE' | 'GRAVISIMA'>('LEVE');
  const [descCaso, setDescCaso] = useState('');
  const [medidaCaso, setMedidaCaso] = useState('');

  const [nuevaCitacionModal, setNuevaCitacionModal] = useState(false);
  const [estudianteCit, setEstudianteCit] = useState('');
  const [fechaCit, setFechaCit] = useState('');
  const [horaCit, setHoraCit] = useState('08:00');
  const [lugarCit, setLugarCit] = useState('Oficina de Coordinación Académica');
  const [motivoCit, setMotivoCit] = useState('');

  const [nuevaObsModal, setNuevaObsModal] = useState(false);
  const [estudianteObs, setEstudianteObs] = useState('');
  const [tipoObs, setTipoObs] = useState('FORMATIVA');
  const [descObs, setDescObs] = useState('');
  const [compObs, setCompObs] = useState('');

  const [nuevoComModal, setNuevoComModal] = useState(false);
  const [tituloCom, setTituloCom] = useState('');
  const [contenidoCom, setContenidoCom] = useState('');
  const [destinatarioCom, setDestinatarioCom] = useState('TODOS');
  const [prioridadCom, setPrioridadCom] = useState('ALTA');

  // Boletín Oficial (Decreto 1290)
  const [boletinTarget, setBoletinTarget] = useState<{
    estudianteId: number;
    estudianteNombre: string;
    grupo: string;
  } | null>(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [grpData, calData, casData, citData, justData, horData, obsData, comData] = await Promise.all([
        api.getGrupos(),
        api.getCalificaciones(),
        api.getCasosConvivencia(),
        api.getCitaciones(),
        api.getJustificaciones(),
        api.getHorarios(),
        api.getObservaciones(),
        api.getComunicados(),
      ]);
      setGrupos(grpData);
      setCalificaciones(calData);
      setCasos(casData);
      setCitaciones(citData);
      setJustificaciones(justData);
      setHorarios(horData);
      setObservaciones(obsData);
      setComunicados(comData);
      if (grpData.length > 0 && !grpData.some((g) => g.codigoGrupo === horarioGrupoFilter)) {
        setHorarioGrupoFilter(grpData[0].codigoGrupo || grpData[0].nombre);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al sincronizar datos de coordinación con el servidor.',
      });
    } finally {
      setLoading(false);
    }
  }, [horarioGrupoFilter]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const handleCrearCaso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteCaso.trim() || !descCaso.trim()) return;
    try {
      const creado = await api.crearCasoConvivencia({
        estudianteNombre: estudianteCaso.trim(),
        tipoSituacion: tipoFalta,
        severidad: severidadCaso,
        descripcion: descCaso.trim(),
        medidaPedagogica: medidaCaso.trim() || 'Mediación escolar y acta de compromiso formativo',
      });
      setCasos((prev) => [creado, ...prev]);
      setEstudianteCaso('');
      setDescCaso('');
      setMedidaCaso('');
      setNuevoCasoModal(false);
      setStatusMessage({ type: 'success', text: `Caso Ley 1620 radicado exitosamente (${creado.radicado}).` });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No fue posible radicar el caso de convivencia.',
      });
    }
  };

  const handleActualizarEstadoCaso = async (id: number, estado: string) => {
    try {
      const actualizado = await api.actualizarCasoConvivencia(id, estado);
      setCasos((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
      setStatusMessage({ type: 'success', text: `Estado del caso #${id} actualizado a ${estado}.` });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error actualizando el caso.',
      });
    }
  };

  const handleCrearCitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteCit.trim() || !motivoCit.trim()) return;
    try {
      const creada = await api.crearCitacion({
        estudianteNombre: estudianteCit.trim(),
        fecha: fechaCit || undefined,
        hora: horaCit || '08:00',
        lugar: lugarCit,
        motivo: motivoCit.trim(),
        modalidad: 'PRESENCIAL',
      });
      setCitaciones((prev) => [creada, ...prev]);
      setEstudianteCit('');
      setMotivoCit('');
      setNuevaCitacionModal(false);
      setStatusMessage({ type: 'success', text: 'Citación formal registrada y vinculada al acudiente.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No fue posible crear la citación.',
      });
    }
  };

  const handleRevisarJustificacion = async (id: number, estado: 'APROBADA_COORDINACION' | 'RECHAZADA') => {
    try {
      const revisada = await api.revisarJustificacion(
        id,
        estado,
        estado === 'APROBADA_COORDINACION'
          ? 'Soporte validado por Coordinación Académica'
          : 'Soporte extemporáneo o incompleto'
      );
      setJustificaciones((prev) => prev.map((j) => (j.id === id ? revisada : j)));
      setStatusMessage({
        type: 'success',
        text: `Justificación #${id} marcada como ${estado.replace(/_/g, ' ')}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al revisar la justificación.',
      });
    }
  };

  const handleAgregarBloqueHorario = async (nuevo: {
    grupo: string;
    dia: string;
    hora: string;
    materia: string;
    docente: string;
    aula: string;
  }) => {
    try {
      const [horaInicio, horaFin] = nuevo.hora.split('-').map((s) => s.trim());
      const creado = await api.crearBloqueHorario({
        grupo: nuevo.grupo,
        dia: nuevo.dia,
        horaInicio: horaInicio || '07:00',
        horaFin: horaFin || '08:00',
        materia: nuevo.materia,
        docente: nuevo.docente,
        aula: nuevo.aula,
      });
      setHorarios((prev) => [...prev, creado]);
      setStatusMessage({ type: 'success', text: 'Bloque horario validado y registrado sin colisiones.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Conflicto de horario detectado en el servidor.',
      });
    }
  };

  const handleEliminarBloqueHorario = async (id: number) => {
    try {
      await api.eliminarBloqueHorario(id);
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      setStatusMessage({ type: 'info', text: 'Bloque de horario eliminado.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo eliminar el bloque horario.',
      });
    }
  };

  const handleCrearObservacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!estudianteObs.trim() || !descObs.trim()) return;
    try {
      const creada = await api.crearObservacion({
        estudianteNombre: estudianteObs.trim(),
        tipo: tipoObs,
        categoriaFalta: tipoObs === 'FORMATIVA' || tipoObs === 'FELICITACION' ? 'NINGUNA' : 'TIPO_I',
        descripcion: descObs.trim(),
        compromisos: compObs.trim() || 'Compromiso pedagógico institucional',
      });
      setObservaciones((prev) => [creada, ...prev]);
      setEstudianteObs('');
      setDescObs('');
      setCompObs('');
      setNuevaObsModal(false);
      setStatusMessage({ type: 'success', text: 'Anotación guardada en el Observador del Estudiante.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error guardando anotación en observador.',
      });
    }
  };

  const handleCrearComunicado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloCom.trim() || !contenidoCom.trim()) return;
    try {
      const creado = await api.crearComunicado({
        titulo: tituloCom.trim(),
        contenido: contenidoCom.trim(),
        destinatarioRol: destinatarioCom,
        prioridad: prioridadCom,
      });
      setComunicados((prev) => [creado, ...prev]);
      setTituloCom('');
      setContenidoCom('');
      setNuevoComModal(false);
      setStatusMessage({ type: 'success', text: 'Comunicado institucional publicado.' });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al publicar comunicado.',
      });
    }
  };

  // Consolidado por docente/materia para auditoría de planillas
  const planillasPorMateria = Object.values(
    calificaciones.reduce<
      Record<
        string,
        {
          docente: string;
          materia: string;
          grupo: string;
          totalNotas: number;
          promedio: number;
          bajos: number;
          estudianteMuestraId: number;
          estudianteMuestraNombre: string;
        }
      >
    >((acc, c) => {
      const key = `${c.cargaAcademicaId}-${c.grupo}`;
      if (!acc[key]) {
        acc[key] = {
          docente: c.docente,
          materia: c.materia,
          grupo: c.grupo,
          totalNotas: 0,
          promedio: 0,
          bajos: 0,
          estudianteMuestraId: c.estudianteId,
          estudianteMuestraNombre: c.estudianteNombre,
        };
      }
      acc[key].totalNotas += 1;
      acc[key].promedio += c.notaDefinitivaPeriodo;
      if (c.escalaDesempeno === 'BAJO') acc[key].bajos += 1;
      return acc;
    }, {})
  );

  const casosActivos = casos.filter((c) => c.estado !== 'CERRADO').length;
  const excusasPendientes = justificaciones.filter((j) => j.estado === 'PENDIENTE_REVISION').length;

  const navGroups: SidebarNavGroup[] = [
    {
      category: 'CONVIVENCIA & SEGUIMIENTO',
      items: [
        { id: 'convivencia', label: 'Casos Ley 1620', icon: <AlertTriangle size={18} />, badge: casosActivos || undefined, badgeTone: casosActivos > 0 ? 'danger' : 'default' },
        { id: 'observador', label: 'Observador Estudiantil', icon: <Award size={18} />, badge: observaciones.length },
        { id: 'citaciones', label: 'Citaciones a Padres', icon: <Calendar size={18} />, badge: citaciones.length },
        { id: 'justificaciones', label: 'Excusas de Asistencia', icon: <FileCheck size={18} />, badge: excusasPendientes || undefined, badgeTone: excusasPendientes > 0 ? 'danger' : 'default' },
      ],
    },
    {
      category: 'ACADÉMICO',
      items: [
        { id: 'auditoria', label: 'Auditoría Planillas', icon: <FileSpreadsheet size={18} /> },
        { id: 'horarios', label: 'Horarios y Aulas', icon: <Clock size={18} /> },
      ],
    },
    {
      category: 'COMUNICACIÓN & IA',
      items: [
        { id: 'comunicados', label: 'Comunicados Oficiales', icon: <Megaphone size={18} /> },
        { id: 'mipa', label: 'Alertas MIPA & Telemetría', icon: <Activity size={18} /> },
      ],
    },
  ];

  return (
    <DashboardShell
      portalTitle="Coordinación Académica & Convivencia"
      portalSubtitle="Ley 1620 & SIEE"
      navGroups={navGroups}
      activeTab={currentTab}
      onSelectTab={(id) => setCurrentTab(id as typeof currentTab)}
      userName={user?.nombreCompleto || 'Coordinación'}
      userRoleLabel={user?.rol || 'COORDINADOR'}
      onLogout={logout}
      headerActions={
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => {
            setCurrentTab('convivencia');
            setNuevoCasoModal(true);
          }}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <Plus size={15} />
          <span>Nuevo Caso</span>
        </button>
      }
    >
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-page-title">Panel de Coordinación Académica & Convivencia</h1>
          <p className="dashboard-page-subtitle">
            Bienvenido, <strong>{user?.nombreCompleto || 'Coordinación'}</strong>. Monitoreo de convivencia Ley 1620, citaciones, excusas y auditoría de planillas.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={() => {
              setCurrentTab('citaciones');
              setNuevaCitacionModal(true);
            }}
          >
            <Calendar size={15} /> Programar Citación
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setCurrentTab('mipa')}
          >
            <Activity size={15} /> Radar MIPA
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

      {/* MÉTRICAS DE COORDINACIÓN */}
      <div className="stats-grid">
        <KpiCard
          icon={<AlertTriangle size={21} />}
          tone="amber"
          badge={`${casos.length} totales`}
          badgeTone={casosActivos > 0 ? 'warning' : 'neutral'}
          value={casosActivos}
          label="Casos Convivencia Activos"
          onClick={() => setCurrentTab('convivencia')}
        />
        <KpiCard
          icon={<Calendar size={21} />}
          tone="blue"
          badge="Agenda"
          badgeTone="primary"
          value={citaciones.length}
          label="Citaciones Programadas"
          onClick={() => setCurrentTab('citaciones')}
        />
        <KpiCard
          icon={<CheckCircle size={21} />}
          tone="emerald"
          badge="SIEE"
          badgeTone="success"
          value={calificaciones.length}
          label="Registros en Planillas"
          onClick={() => setCurrentTab('auditoria')}
        />
        <KpiCard
          icon={<Clock size={21} />}
          tone="rose"
          badge="Pendientes"
          badgeTone={excusasPendientes > 0 ? 'danger' : 'neutral'}
          value={excusasPendientes}
          label="Excusas por Validar"
          onClick={() => setCurrentTab('justificaciones')}
        />
      </div>

      {loading ? (
        <EmptyOrLoadingState loading={true} message="Sincronizando expedientes de coordinación..." />
      ) : (
        <>
          {/* TAB 1: CASOS DE CONVIVENCIA */}
          {currentTab === 'convivencia' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Libro de Convivencia Escolar (Ley 1620 de 2013)</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Tipificación oficial de situaciones de convivencia escolar y seguimiento al debido proceso.
                  </p>
                </div>
                <button type="button" className="btn-primary-action" onClick={() => setNuevoCasoModal(!nuevoCasoModal)}>
                  <Plus size={16} />
                  <span>Registrar Situación</span>
                </button>
              </div>

              {nuevoCasoModal && (
                <form
                  onSubmit={handleCrearCaso}
                  style={{
                    padding: '1.35rem 1.5rem',
                    background: 'var(--ec-surface-low)',
                    borderBottom: '1px solid var(--ec-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
                  }}
                >
                  <h4 style={{ color: 'var(--ec-primary-dark)', margin: 0 }}>Radicar Situación Convivencial</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <input
                      type="text"
                      placeholder="Nombre del estudiante matriculado"
                      className="form-input"
                      value={estudianteCaso}
                      onChange={(e) => setEstudianteCaso(e.target.value)}
                      required
                    />
                    <select
                      className="form-input"
                      value={tipoFalta}
                      onChange={(e) => setTipoFalta(e.target.value as 'TIPO_I' | 'TIPO_II' | 'TIPO_III')}
                    >
                      <option value="TIPO_I">Tipo I (Conflicto manejable)</option>
                      <option value="TIPO_II">Tipo II (Agresión / Acoso escolar)</option>
                      <option value="TIPO_III">Tipo III (Presunto delito / Ruta externa)</option>
                    </select>
                    <select
                      className="form-input"
                      value={severidadCaso}
                      onChange={(e) => setSeveridadCaso(e.target.value as 'LEVE' | 'GRAVE' | 'GRAVISIMA')}
                    >
                      <option value="LEVE">Severidad Leve</option>
                      <option value="GRAVE">Severidad Grave</option>
                      <option value="GRAVISIMA">Severidad Gravísima</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Relato objetivo de los hechos observados..."
                    className="form-input"
                    style={{ minHeight: '70px' }}
                    value={descCaso}
                    onChange={(e) => setDescCaso(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Medida pedagógica o protocolo activado..."
                    className="form-input"
                    value={medidaCaso}
                    onChange={(e) => setMedidaCaso(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary-action" onClick={() => setNuevoCasoModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary-action">
                      Radicar Caso
                    </button>
                  </div>
                </form>
              )}

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Radicado</th>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th>Tipificación</th>
                      <th>Descripción del Hecho</th>
                      <th>Medida Pedagógica</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {casos.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <code style={{ background: 'var(--ec-surface-low)', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                            {c.radicado}
                          </code>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{c.estudianteNombre}</td>
                        <td><span className="grade-badge alto">{c.grupo}</span></td>
                        <td>
                          <span className={`grade-badge ${c.tipoFalta === 'TIPO_I' ? 'basico' : 'bajo'}`}>
                            {c.tipoFalta} ({c.severidad})
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{c.descripcion}</td>
                        <td style={{ maxWidth: '240px', fontSize: '0.84rem', color: 'var(--ec-text-muted)' }}>
                          {c.medidaPedagogica}
                        </td>
                        <td>
                          <span className={`grade-badge ${c.estado === 'CERRADO' ? 'superior' : 'alto'}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          {c.estado !== 'CERRADO' && (
                            <button
                              type="button"
                              onClick={() => handleActualizarEstadoCaso(c.id, 'CERRADO')}
                              className="btn-secondary-action"
                              style={{ padding: '0.32rem 0.7rem', fontSize: '0.78rem', color: 'var(--ec-success)', borderColor: 'var(--ec-success-border)' }}
                            >
                              Cerrar Caso
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: OBSERVADOR ESTUDIANTIL */}
          {currentTab === 'observador' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Observador Integral del Estudiante</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Anotaciones formativas, felicitaciones y compromisos pedagógicos con firma digital.
                  </p>
                </div>
                <button type="button" className="btn-primary-action" onClick={() => setNuevaObsModal(!nuevaObsModal)}>
                  <Plus size={16} />
                  <span>Nueva Anotación</span>
                </button>
              </div>

              {nuevaObsModal && (
                <form
                  onSubmit={handleCrearObservacion}
                  style={{
                    padding: '1.35rem 1.5rem',
                    background: 'var(--ec-surface-low)',
                    borderBottom: '1px solid var(--ec-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                    <input
                      type="text"
                      placeholder="Nombre del estudiante"
                      className="form-input"
                      value={estudianteObs}
                      onChange={(e) => setEstudianteObs(e.target.value)}
                      required
                    />
                    <select className="form-input" value={tipoObs} onChange={(e) => setTipoObs(e.target.value)}>
                      <option value="FORMATIVA">Anotación Formativa</option>
                      <option value="FELICITACION">Felicitación / Mérito</option>
                      <option value="ACADEMICA">Seguimiento Académico</option>
                      <option value="CONVIVENCIA">Llamado de Atención</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Descripción de la observación..."
                    className="form-input"
                    value={descObs}
                    onChange={(e) => setDescObs(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Compromiso adquirido..."
                    className="form-input"
                    value={compObs}
                    onChange={(e) => setCompObs(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary-action" onClick={() => setNuevaObsModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary-action">
                      Guardar en Observador
                    </button>
                  </div>
                </form>
              )}

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Compromiso</th>
                      <th>Firmas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observaciones.map((o) => (
                      <tr key={o.id}>
                        <td>{o.fecha}</td>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{o.estudianteNombre}</td>
                        <td><span className="grade-badge alto">{o.grupo}</span></td>
                        <td>
                          <span className={`grade-badge ${o.tipo === 'FELICITACION' ? 'superior' : 'basico'}`}>
                            {o.tipo}
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{o.descripcion}</td>
                        <td style={{ maxWidth: '240px', fontSize: '0.84rem', color: 'var(--ec-text-muted)' }}>{o.compromisos}</td>
                        <td>
                          <span className={`grade-badge ${o.firmadoEstudiante || o.firmadoAcudiente ? 'superior' : 'basico'}`}>
                            {o.firmadoEstudiante || o.firmadoAcudiente ? 'Firmado' : 'Pendiente firma'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CITACIONES A PADRES */}
          {currentTab === 'citaciones' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Agenda Oficial de Citaciones a Acudientes</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Notificaciones formales de comparecencia a padres de familia y acudientes autorizados.
                  </p>
                </div>
                <button type="button" className="btn-primary-action" onClick={() => setNuevaCitacionModal(!nuevaCitacionModal)}>
                  <Plus size={16} />
                  <span>Nueva Citación</span>
                </button>
              </div>

              {nuevaCitacionModal && (
                <form
                  onSubmit={handleCrearCitacion}
                  style={{
                    padding: '1.35rem 1.5rem',
                    background: 'var(--ec-surface-low)',
                    borderBottom: '1px solid var(--ec-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
                  }}
                >
                  <h4 style={{ color: 'var(--ec-primary-dark)', margin: 0 }}>Programar Citación a Padre / Acudiente</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
                    <input
                      type="text"
                      placeholder="Nombre del Estudiante"
                      className="form-input"
                      value={estudianteCit}
                      onChange={(e) => setEstudianteCit(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      className="form-input"
                      value={fechaCit}
                      onChange={(e) => setFechaCit(e.target.value)}
                      required
                    />
                    <input
                      type="time"
                      className="form-input"
                      value={horaCit}
                      onChange={(e) => setHoraCit(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Lugar de atención"
                      className="form-input"
                      value={lugarCit}
                      onChange={(e) => setLugarCit(e.target.value)}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Motivo institucional de la citación..."
                    className="form-input"
                    value={motivoCit}
                    onChange={(e) => setMotivoCit(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary-action" onClick={() => setNuevaCitacionModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary-action">
                      Enviar Citación
                    </button>
                  </div>
                </form>
              )}

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Acudiente Vinculado</th>
                      <th>Convoca</th>
                      <th>Fecha y Hora</th>
                      <th>Lugar / Modalidad</th>
                      <th>Motivo Institucional</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citaciones.map((cit) => (
                      <tr key={cit.id}>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{cit.estudianteNombre}</td>
                        <td>{cit.acudiente}</td>
                        <td>{cit.convocadoPor}</td>
                        <td style={{ color: 'var(--ec-primary)', fontWeight: 600 }}>
                          {cit.fecha} — {cit.hora}
                        </td>
                        <td>
                          {cit.lugar} ({cit.modalidad})
                        </td>
                        <td style={{ fontSize: '0.86rem' }}>{cit.motivo}</td>
                        <td>
                          <span className={`grade-badge ${cit.estado === 'CONFIRMADA' || cit.estado === 'REALIZADA' ? 'superior' : 'basico'}`}>
                            {cit.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REVISIÓN DE JUSTIFICACIONES DE INASISTENCIA */}
          {currentTab === 'justificaciones' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Validación de Excusas e Incapacidades Médicas</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Al aprobar una excusa, el servidor actualiza automáticamente el registro de asistencia del estudiante.
                  </p>
                </div>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th>Asignatura</th>
                      <th>Fecha Falta</th>
                      <th>Acudiente</th>
                      <th>Motivo y Soporte</th>
                      <th>Estado</th>
                      <th>Decisión Coordinación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {justificaciones.map((j) => (
                      <tr key={j.id}>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{j.estudianteNombre}</td>
                        <td><span className="grade-badge alto">{j.grupo}</span></td>
                        <td>{j.materia}</td>
                        <td>{j.fechaInasistencia}</td>
                        <td>{j.acudiente}</td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>
                          <div>{j.motivo}</div>
                          {j.soporte && <code style={{ fontSize: '0.75rem', color: 'var(--ec-primary)' }}>Soporte: {j.soporte}</code>}
                        </td>
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
                        <td>
                          {j.estado === 'PENDIENTE_REVISION' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => handleRevisarJustificacion(j.id, 'APROBADA_COORDINACION')}
                                className="btn-secondary-action"
                                style={{ padding: '0.32rem 0.65rem', fontSize: '0.75rem', color: 'var(--ec-success)', borderColor: 'var(--ec-success-border)' }}
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRevisarJustificacion(j.id, 'RECHAZADA')}
                                className="btn-danger-action"
                                style={{ padding: '0.32rem 0.65rem', fontSize: '0.75rem' }}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--ec-text-muted)' }}>
                              {j.observacionCoordinacion || 'Revisada'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AUDITORÍA DE PLANILLAS Y COMISIONES DE EVALUACIÓN */}
          {currentTab === 'auditoria' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Auditoría de Planillas Docentes y Comisiones (Decreto 1290)</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Consolidado en tiempo real desde la tabla de calificaciones de PostgreSQL.
                  </p>
                </div>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Docente Titular</th>
                      <th>Asignatura</th>
                      <th>Grupo</th>
                      <th>Notas Registradas</th>
                      <th>Promedio Grupo</th>
                      <th>Desempeños Bajos</th>
                      <th>Boletín Muestra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planillasPorMateria.map((item, idx) => {
                      const prom = item.totalNotas > 0 ? item.promedio / item.totalNotas : 0;
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{item.docente}</td>
                          <td>{item.materia}</td>
                          <td><span className="grade-badge alto">{item.grupo}</span></td>
                          <td>{item.totalNotas} estudiantes calificados</td>
                          <td>
                            <span className={`grade-badge ${prom >= 4.0 ? 'superior' : prom >= 3.0 ? 'basico' : 'bajo'}`}>
                              {prom.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            {item.bajos === 0 ? (
                              <span className="grade-badge superior">0 en riesgo</span>
                            ) : (
                              <span className="grade-badge bajo">{item.bajos} en nivelación</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', color: 'var(--ec-primary)' }}
                              onClick={() =>
                                setBoletinTarget({
                                  estudianteId: item.estudianteMuestraId,
                                  estudianteNombre: item.estudianteMuestraNombre,
                                  grupo: item.grupo,
                                })
                              }
                            >
                              <FileText size={13} /> Ver Boletín Oficial
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HORARIOS INSTITUCIONALES */}
          {currentTab === 'horarios' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Horario Escolar Semanal (Validación Anticruce)</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Selecciona el grupo para inspeccionar o programar bloques horarios oficiales.
                  </p>
                </div>

                <select
                  className="form-input"
                  style={{ width: 'auto', minWidth: '185px' }}
                  value={horarioGrupoFilter}
                  onChange={(e) => setHorarioGrupoFilter(e.target.value)}
                >
                  <option value="TODOS">Todos los Grupos</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.codigoGrupo || g.nombre}>
                      Grupo {g.codigoGrupo || g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="panel-body">
                <HorarioSemanalGrid
                  bloques={
                    horarioGrupoFilter === 'TODOS'
                      ? horarios
                      : horarios.filter((h) => h.grupo.toLowerCase().includes(horarioGrupoFilter.toLowerCase()))
                  }
                  editable={true}
                  onAddBloque={handleAgregarBloqueHorario}
                  onDeleteBloque={handleEliminarBloqueHorario}
                  gruposDisponibles={grupos.map((g) => g.codigoGrupo || g.nombre)}
                />
              </div>
            </div>
          )}

          {/* TAB 7: COMUNICADOS OFICIALES */}
          {currentTab === 'comunicados' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Circulares y Comunicados de Coordinación</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Publicación inmediata en los portales de docentes, estudiantes y acudientes.
                  </p>
                </div>
                <button type="button" className="btn-primary-action" onClick={() => setNuevoComModal(!nuevoComModal)}>
                  <Plus size={16} />
                  <span>Emitir Circular</span>
                </button>
              </div>

              {nuevoComModal && (
                <form
                  onSubmit={handleCrearComunicado}
                  style={{
                    padding: '1.35rem 1.5rem',
                    background: 'var(--ec-surface-low)',
                    borderBottom: '1px solid var(--ec-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
                    <input
                      type="text"
                      placeholder="Título del comunicado institucional"
                      className="form-input"
                      value={tituloCom}
                      onChange={(e) => setTituloCom(e.target.value)}
                      required
                    />
                    <select
                      className="form-input"
                      value={destinatarioCom}
                      onChange={(e) => setDestinatarioCom(e.target.value)}
                    >
                      <option value="TODOS">Toda la Comunidad</option>
                      <option value="DOCENTE">Docentes</option>
                      <option value="ESTUDIANTE">Estudiantes</option>
                      <option value="TUTOR">Padres / Acudientes</option>
                    </select>
                    <select
                      className="form-input"
                      value={prioridadCom}
                      onChange={(e) => setPrioridadCom(e.target.value)}
                    >
                      <option value="NORMAL">Prioridad Normal</option>
                      <option value="ALTA">Prioridad Alta</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Contenido oficial de la circular..."
                    className="form-input"
                    rows={3}
                    value={contenidoCom}
                    onChange={(e) => setContenidoCom(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-secondary-action" onClick={() => setNuevoComModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary-action">
                      Publicar Comunicado
                    </button>
                  </div>
                </form>
              )}

              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {comunicados.map((com) => (
                  <div
                    key={com.id}
                    style={{
                      background: 'var(--ec-surface-low)',
                      border: '1px solid var(--ec-border)',
                      borderRadius: '14px',
                      padding: '1.1rem 1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--ec-text)', fontSize: '0.98rem' }}>{com.titulo}</strong>
                      <span className="grade-badge alto">{com.destinatarios}</span>
                    </div>
                    <p style={{ color: 'var(--ec-text-secondary)', fontSize: '0.88rem', marginBottom: '0.45rem', lineHeight: 1.5 }}>{com.contenido}</p>
                    <div style={{ fontSize: '0.76rem', color: 'var(--ec-text-muted)' }}>
                      Publicado por: {com.autor} ({com.rolAutor}) — {com.fecha}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ALERTAS MIPA & TELEMETRÍA */}
          {currentTab === 'mipa' && <MipaTelemetriaPanel userRole={user?.rol} />}
        </>
      )}

      {/* MODAL BOLETÍN OFICIAL DE CALIFICACIONES (DECRETO 1290) */}
      {boletinTarget && (
        <BoletinOficialModal
          isOpen={true}
          onClose={() => setBoletinTarget(null)}
          estudianteId={boletinTarget.estudianteId}
          estudianteNombre={boletinTarget.estudianteNombre}
          grupo={boletinTarget.grupo}
          periodo="Primer Periodo 2026"
          calificaciones={calificaciones
            .filter((c) => c.estudianteId === boletinTarget.estudianteId)
            .map((c) => ({
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

export default CoordinadorDashboard;
