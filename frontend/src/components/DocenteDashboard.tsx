import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  AsistenciaDto,
  CalificacionDto,
  CargaAcademicaDto,
  CitacionDto,
  HorarioBloqueDto,
  ObservacionDto,
  PeriodoAcademicoDto,
  SolicitudNotaDto,
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
  BookOpen,
  Save,
  CheckCircle,
  Users,
  Calendar,
  ShieldAlert,
  Phone,
  Search,
  Plus,
  Award,
  FileText,
  Lock,
  X,
} from 'lucide-react';

interface DocenteEstudianteAsociado {
  matriculaId: number;
  estudianteId: number;
  usuarioId: number;
  documento: string;
  codigoEstudiantil: string;
  nombreCompleto: string;
  grupoId: number;
  grupo: string;
}

interface EditableGradeRow {
  matriculaId: number;
  estudianteId: number;
  codigo: string;
  nombre: string;
  grupo: string;
  cognitiva: number;
  procedimental: number;
  actitudinal: number;
  definitiva: number;
  desempeno: 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO';
  juicioValorativo: string;
  planMejoramiento: string;
  calificacionId?: number;
}

export const DocenteDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const [currentTab, setCurrentTab] = useState<
    | 'calificaciones_materia'
    | 'asistencia_materia'
    | 'solicitudes_nota'
    | 'grupo_consolidado'
    | 'grupo_observador'
    | 'grupo_citaciones'
    | 'horario'
  >('calificaciones_materia');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingPlanilla = useRef(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [esDirectorGrupo, setEsDirectorGrupo] = useState<boolean>(Boolean(user?.esDirectorGrupo));
  const [grupoDireccion, setGrupoDireccion] = useState<string>(user?.grupoAsignado || '10-A');
  const [grupoDireccionId, setGrupoDireccionId] = useState<number | undefined>(user?.grupoAsignadoId);

  const [cargas, setCargas] = useState<CargaAcademicaDto[]>([]);
  const [selectedCargaId, setSelectedCargaId] = useState<number>(0);
  const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number>(0);

  const [estudiantesAsociados, setEstudiantesAsociados] = useState<DocenteEstudianteAsociado[]>([]);
  const [calificacionesAll, setCalificacionesAll] = useState<CalificacionDto[]>([]);
  const [gradeRows, setGradeRows] = useState<EditableGradeRow[]>([]);

  const [asistenciaMap, setAsistenciaMap] = useState<
    Record<number, 'PRESENTE' | 'TARDE' | 'EXCUSA_MEDICA' | 'AUSENTE'>
  >({});
  const [asistenciaHistory, setAsistenciaHistory] = useState<AsistenciaDto[]>([]);
  const [solicitudesNota, setSolicitudesNota] = useState<SolicitudNotaDto[]>([]);
  const [observaciones, setObservaciones] = useState<ObservacionDto[]>([]);
  const [citaciones, setCitaciones] = useState<CitacionDto[]>([]);
  const [horarios, setHorarios] = useState<HorarioBloqueDto[]>([]);
  const [vistaHorarioDocente, setVistaHorarioDocente] = useState<'mis_clases' | 'grupo_completo'>('mis_clases');
  const [searchGrupoEst, setSearchGrupoEst] = useState('');

  // Modal Solicitud Modificación Nota (cuando el periodo está cerrado)
  const [solicitudModalRow, setSolicitudModalRow] = useState<EditableGradeRow | null>(null);
  const [motivoSolicitud, setMotivoSolicitud] = useState('');

  // Modal Observador
  const [anotacionModal, setAnotacionModal] = useState(false);
  const [selectedAlumnoObs, setSelectedAlumnoObs] = useState<string>('');
  const [tipoAnotacion, setTipoAnotacion] = useState<string>('FORMATIVA');
  const [descAnotacion, setDescAnotacion] = useState('');
  const [compromisoAnotacion, setCompromisoAnotacion] = useState('');

  // Modal Citación
  const [citacionModal, setCitacionModal] = useState(false);
  const [citacionAlumno, setCitacionAlumno] = useState<string>('');
  const [citacionFecha, setCitacionFecha] = useState<string>('');
  const [citacionHora, setCitacionHora] = useState<string>('08:00');
  const [citacionMotivo, setCitacionMotivo] = useState<string>('Seguimiento pedagógico y acuerdos de nivelación');

  // Boletín Oficial (Decreto 1290)
  const [boletinTarget, setBoletinTarget] = useState<{
    estudianteId: number;
    estudianteNombre: string;
    estudianteDocumento: string;
    estudianteCodigo: string;
    grupo: string;
  } | null>(null);

  const calcularDefinitivaDecreto1290 = (cog: number, proc: number, act: number) => {
    const def = Number((cog * 0.4 + proc * 0.3 + act * 0.3).toFixed(2));
    let des: 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO' = 'BAJO';
    if (def >= 4.6) des = 'SUPERIOR';
    else if (def >= 4.0) des = 'ALTO';
    else if (def >= 3.0) des = 'BASICO';
    return { def, des };
  };

  const construirFilasPlanilla = useCallback(
    (
      cargaId: number,
      periodoId: number,
      cargasList: CargaAcademicaDto[],
      estudiantesList: DocenteEstudianteAsociado[],
      califsList: CalificacionDto[]
    ) => {
      const cargaActual = cargasList.find((c) => c.id === cargaId);
      if (!cargaActual) {
        setGradeRows([]);
        return;
      }
      const alumnosDelGrupo = estudiantesList.filter((e) => e.grupoId === cargaActual.grupoId);
      const rows: EditableGradeRow[] = alumnosDelGrupo.map((est) => {
        const existente = califsList.find(
          (c) =>
            c.estudianteId === est.estudianteId &&
            c.cargaAcademicaId === cargaId &&
            (periodoId === 0 || c.periodoId === periodoId)
        );
        const cog = existente ? existente.notaCognitiva : 3.5;
        const proc = existente ? existente.notaProcedimental : 3.5;
        const act = existente ? existente.notaActitudinal : 3.5;
        const { def, des } = calcularDefinitivaDecreto1290(cog, proc, act);
        return {
          matriculaId: est.matriculaId,
          estudianteId: est.estudianteId,
          codigo: est.codigoEstudiantil,
          nombre: est.nombreCompleto,
          grupo: est.grupo,
          cognitiva: cog,
          procedimental: proc,
          actitudinal: act,
          definitiva: existente ? existente.notaDefinitivaPeriodo : def,
          desempeno: existente ? existente.escalaDesempeno : des,
          juicioValorativo: existente?.juicioValorativo || '',
          planMejoramiento: existente?.planMejoramiento || '',
          calificacionId: existente?.id,
        };
      });
      setGradeRows(rows);

      const initialAttendance: Record<number, 'PRESENTE' | 'TARDE' | 'EXCUSA_MEDICA' | 'AUSENTE'> = {};
      alumnosDelGrupo.forEach((a) => {
        initialAttendance[a.matriculaId] = 'PRESENTE';
      });
      setAsistenciaMap(initialAttendance);
    },
    []
  );

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [ctx, perData, calData, asisData, solData, obsData, citData, horData] = await Promise.all([
        api.getContextoDocente(),
        api.getPeriodosConfig(),
        api.getCalificaciones(),
        api.getAsistencias(),
        api.getSolicitudesCambioNota(),
        api.getObservaciones(),
        api.getCitaciones(),
        api.getHorarios(),
      ]);

      setEsDirectorGrupo(ctx.esDirectorGrupo || user?.rol === 'DIRECTOR_GRUPO');
      if (ctx.grupoDireccion) setGrupoDireccion(ctx.grupoDireccion);
      if (ctx.grupoDireccionId) setGrupoDireccionId(ctx.grupoDireccionId);

      setCargas(ctx.cargasAcademicas);
      setEstudiantesAsociados(ctx.estudiantesAsociados);
      setPeriodos(perData);
      setCalificacionesAll(calData);
      setAsistenciaHistory(asisData);
      setSolicitudesNota(solData);
      setObservaciones(obsData);
      setCitaciones(citData);
      setHorarios(horData);

      const firstCargaId = ctx.cargasAcademicas[0]?.id || 0;
      const firstPeriodoId = perData[0]?.id || 0;
      setSelectedCargaId(firstCargaId);
      setSelectedPeriodoId(firstPeriodoId);

      construirFilasPlanilla(firstCargaId, firstPeriodoId, ctx.cargasAcademicas, ctx.estudiantesAsociados, calData);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al sincronizar el portal docente con el servidor.',
      });
    } finally {
      setLoading(false);
    }
  }, [construirFilasPlanilla, user?.rol]);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  const handleSeleccionarCargaOPeriodo = (nuevoCargaId: number, nuevoPeriodoId: number) => {
    setSelectedCargaId(nuevoCargaId);
    setSelectedPeriodoId(nuevoPeriodoId);
    construirFilasPlanilla(nuevoCargaId, nuevoPeriodoId, cargas, estudiantesAsociados, calificacionesAll);
  };

  const handleGradeChange = (
    estudianteId: number,
    field: 'cognitiva' | 'procedimental' | 'actitudinal',
    value: string
  ) => {
    const num = Math.min(5.0, Math.max(1.0, parseFloat(value) || 1.0));
    setGradeRows((prev) =>
      prev.map((row) => {
        if (row.estudianteId !== estudianteId) return row;
        const updated = { ...row, [field]: num };
        const { def, des } = calcularDefinitivaDecreto1290(
          updated.cognitiva,
          updated.procedimental,
          updated.actitudinal
        );
        return { ...updated, definitiva: def, desempeno: des };
      })
    );
  };

  const periodoSeleccionadoObj = periodos.find((p) => p.id === selectedPeriodoId);
  const isPeriodoCerrado = Boolean(periodoSeleccionadoObj?.cerrado);
  const cargaSeleccionadaObj = cargas.find((c) => c.id === selectedCargaId);

  const handleSaveGrades = async () => {
    if (!selectedCargaId || !selectedPeriodoId || savingPlanilla.current || gradeRows.length === 0) return;
    if (isPeriodoCerrado) {
      setStatusMessage({
        type: 'error',
        text: 'El periodo académico se encuentra cerrado por Rectoría. Utilice el botón "Solicitar Cambio" en la fila del estudiante.',
      });
      return;
    }

    savingPlanilla.current = true;
    setSaving(true);
    try {
      const nuevosRegistros = await api.guardarPlanillaCalificaciones(gradeRows.map((row) => ({
        matriculaId: row.matriculaId,
        estudianteId: row.estudianteId,
        cargaAcademicaId: selectedCargaId,
        periodoId: selectedPeriodoId,
        notaCognitiva: row.cognitiva,
        notaProcedimental: row.procedimental,
        notaActitudinal: row.actitudinal,
        juicioValorativo: row.juicioValorativo || undefined,
        planMejoramiento: row.definitiva < 3.0 ? row.planMejoramiento || 'Plan de nivelación pedagógica Decreto 1290' : undefined,
      })));

      const todasActualizadas = await api.getCalificaciones();
      setCalificacionesAll(todasActualizadas);
      construirFilasPlanilla(selectedCargaId, selectedPeriodoId, cargas, estudiantesAsociados, todasActualizadas);

      setStatusMessage({
        type: 'success',
        text: `Planilla Decreto 1290 (${nuevosRegistros.length} estudiantes) guardada en PostgreSQL.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error guardando calificaciones en el servidor.',
      });
    } finally {
      savingPlanilla.current = false;
      setSaving(false);
    }
  };

  const handleEnviarSolicitudCambioNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudModalRow || !motivoSolicitud.trim()) return;
    try {
      const creada = await api.crearSolicitudCambioNota({
        calificacionId: solicitudModalRow.calificacionId,
        estudianteNombre: solicitudModalRow.nombre,
        materiaNombre: cargaSeleccionadaObj?.materia || 'Asignatura',
        grupo: solicitudModalRow.grupo,
        periodo: periodoSeleccionadoObj?.nombre || 'Periodo 1',
        notaAnterior: solicitudModalRow.definitiva,
        notaNuevaCognitiva: solicitudModalRow.cognitiva,
        notaNuevaProcedimental: solicitudModalRow.procedimental,
        notaNuevaActitudinal: solicitudModalRow.actitudinal,
        motivo: motivoSolicitud.trim(),
      });
      setSolicitudesNota((prev) => [creada, ...prev]);
      setSolicitudModalRow(null);
      setMotivoSolicitud('');
      setStatusMessage({
        type: 'success',
        text: 'Solicitud de modificación de nota enviada a Rectoría para aprobación.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo radicar la solicitud de cambio de nota.',
      });
    }
  };

  const toggleAsistenciaEstado = (matriculaId: number) => {
    const orden: Array<'PRESENTE' | 'TARDE' | 'EXCUSA_MEDICA' | 'AUSENTE'> = [
      'PRESENTE',
      'TARDE',
      'EXCUSA_MEDICA',
      'AUSENTE',
    ];
    setAsistenciaMap((prev) => {
      const actual = prev[matriculaId] || 'PRESENTE';
      const sig = orden[(orden.indexOf(actual) + 1) % orden.length];
      return { ...prev, [matriculaId]: sig };
    });
  };

  const handleGuardarAsistencia = async () => {
    if (!selectedCargaId || savingPlanilla.current || gradeRows.length === 0) return;
    savingPlanilla.current = true;
    setSaving(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      await api.guardarPlanillaAsistencias(gradeRows.map((row) => {
        const estado = asistenciaMap[row.matriculaId] || 'PRESENTE';
        return {
          matriculaId: row.matriculaId,
          estudianteId: row.estudianteId,
          cargaAcademicaId: selectedCargaId,
          fecha: hoy,
          estado,
          minutosRetraso: estado === 'TARDE' ? 10 : 0,
          observacion: estado === 'AUSENTE' ? 'Inasistencia reportada en clase' : 'Control diario de aula',
        };
      }));
      const actualizado = await api.getAsistencias();
      setAsistenciaHistory(actualizado);
      setStatusMessage({
        type: 'success',
        text: 'Registro de asistencia de la sesión guardado en PostgreSQL.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error guardando asistencia.',
      });
    } finally {
      savingPlanilla.current = false;
      setSaving(false);
    }
  };

  const handleCrearAnotacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descAnotacion.trim() || !selectedAlumnoObs.trim()) return;
    try {
      const creada = await api.crearObservacion({
        estudianteNombre: selectedAlumnoObs,
        tipo: tipoAnotacion,
        categoriaFalta: tipoAnotacion === 'FORMATIVA' || tipoAnotacion === 'FELICITACION' ? 'NINGUNA' : 'TIPO_I',
        descripcion: descAnotacion.trim(),
        compromisos: compromisoAnotacion.trim() || 'Cumplimiento de normas pedagógicas de aula',
      });
      setObservaciones((prev) => [creada, ...prev]);
      setAnotacionModal(false);
      setDescAnotacion('');
      setCompromisoAnotacion('');
      setStatusMessage({
        type: 'success',
        text: `Anotación registrada en el observador de ${selectedAlumnoObs}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al registrar anotación.',
      });
    }
  };

  const handleCrearCitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citacionAlumno.trim() || !citacionMotivo.trim()) return;
    try {
      const creada = await api.crearCitacion({
        estudianteNombre: citacionAlumno,
        fecha: citacionFecha || undefined,
        hora: citacionHora || '08:00',
        lugar: 'Sala de Atención a Padres',
        motivo: citacionMotivo.trim(),
        modalidad: 'PRESENCIAL',
      });
      setCitaciones((prev) => [creada, ...prev]);
      setCitacionModal(false);
      setStatusMessage({
        type: 'success',
        text: `Citación oficial registrada para el acudiente de ${citacionAlumno}.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al programar citación.',
      });
    }
  };

  const alumnosDireccionGrupo = estudiantesAsociados.filter((e) =>
    grupoDireccionId ? e.grupoId === grupoDireccionId : e.grupo.toLowerCase().includes(grupoDireccion.toLowerCase())
  );

  const navGroups: SidebarNavGroup[] = [
    {
      category: 'MIS ASIGNATURAS DICTADAS',
      items: [
        { id: 'calificaciones_materia', label: 'Planilla Decreto 1290', icon: <BookOpen size={18} /> },
        { id: 'asistencia_materia', label: 'Asistencia a Clase', icon: <CheckCircle size={18} /> },
        { id: 'solicitudes_nota', label: 'Solicitudes a Rectoría', icon: <Lock size={18} />, badge: solicitudesNota.length || undefined },
      ],
    },
    {
      category: `DIRECCIÓN DE GRUPO (${grupoDireccion})`,
      items: [
        { id: 'grupo_consolidado', label: 'Consolidado del Curso', icon: <Award size={18} />, hidden: !esDirectorGrupo },
        { id: 'grupo_observador', label: 'Observador Convivencial', icon: <ShieldAlert size={18} />, hidden: !esDirectorGrupo },
        { id: 'grupo_citaciones', label: 'Citaciones a Padres', icon: <Phone size={18} />, hidden: !esDirectorGrupo },
      ],
    },
    {
      category: 'PROGRAMACIÓN',
      items: [{ id: 'horario', label: 'Horario Semanal', icon: <Calendar size={18} /> }],
    },
  ];

  const promedioPlanilla =
    gradeRows.length > 0
      ? (gradeRows.reduce((acc, r) => acc + r.definitiva, 0) / gradeRows.length).toFixed(2)
      : '0.00';

  return (
    <DashboardShell
      portalTitle={esDirectorGrupo ? `Docente & Dir. de Grupo ${grupoDireccion}` : 'Portal Docente'}
      portalSubtitle={esDirectorGrupo ? `Dirección ${grupoDireccion}` : 'Docente Titular'}
      navGroups={navGroups}
      activeTab={currentTab}
      onSelectTab={(id) => setCurrentTab(id as typeof currentTab)}
      userName={user?.nombreCompleto || 'Docente'}
      userRoleLabel={user?.rol || 'DOCENTE'}
      userSubLabel={esDirectorGrupo ? `Dir. ${grupoDireccion}` : undefined}
      onLogout={logout}
      headerActions={
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => setCurrentTab('asistencia_materia')}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <CheckCircle size={15} />
          <span>Asistencia Rápida</span>
        </button>
      }
    >
      {/* BANNER CONTEXTUAL STITCH */}
      <div className="ec-hero-banner">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.16)', padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 700, marginBottom: '0.55rem' }}>
            <span>{esDirectorGrupo ? `Director de Grupo ${grupoDireccion}` : 'Docente Titular'}</span>
            <span>·</span>
            <span>{cargas.length} asignaciones activas</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: '#FFFFFF' }}>
            {cargaSeleccionadaObj
              ? `${cargaSeleccionadaObj.materia} — Grupo ${cargaSeleccionadaObj.grupo}`
              : 'Gestión Académica y Formativa'}
          </h1>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.86)' }}>
            Docente: <strong>{user?.nombreCompleto}</strong> · {gradeRows.length} estudiantes en planilla activa
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCurrentTab('asistencia_materia')}
            style={{
                  background: 'var(--ec-surface-card)',
              color: 'var(--ec-primary-dark)',
              padding: '0.6rem 1rem',
              borderRadius: '11px',
              fontWeight: 700,
              fontSize: '0.83rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <CheckCircle size={15} /> Tomar Asistencia
          </button>
          {esDirectorGrupo && (
            <button
              type="button"
              onClick={() => setCurrentTab('grupo_consolidado')}
              style={{
                background: 'rgba(255,255,255,0.16)',
                color: 'var(--ec-text)',
                border: '1px solid var(--ec-border)',
                padding: '0.6rem 1rem',
                borderRadius: '11px',
                fontWeight: 600,
                fontSize: '0.83rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Users size={15} /> Mi Grupo {grupoDireccion}
            </button>
          )}
        </div>
      </div>

      {/* KPIs REALES DOCENTE */}
      <div className="stats-grid">
        <KpiCard
          icon={<BookOpen size={20} />}
          tone="blue"
          badge="Carga"
          badgeTone="primary"
          value={cargas.length}
          label="Asignaturas Asignadas"
        />
        <KpiCard
          icon={<Users size={20} />}
          tone="emerald"
          badge={cargaSeleccionadaObj?.grupo || 'Curso'}
          badgeTone="success"
          value={gradeRows.length}
          label="Estudiantes en Planilla"
        />
        <KpiCard
          icon={<Award size={20} />}
          tone="indigo"
          badge="SIEE"
          value={promedioPlanilla}
          label="Promedio de la Planilla"
        />
        <KpiCard
          icon={<Lock size={20} />}
          tone="amber"
          badge="Rectoría"
          value={solicitudesNota.length}
          label="Solicitudes Radicadas"
          onClick={() => setCurrentTab('solicitudes_nota')}
        />
      </div>

      {statusMessage && (
        <StatusBanner
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {loading ? (
        <EmptyOrLoadingState loading={true} message="Cargando carga académica y planillas docentes..." />
      ) : (
        <>
          {/* PESTAÑA 1: CALIFICACIONES POR MATERIA */}
          {currentTab === 'calificaciones_materia' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <h3>Planilla Oficial Decreto 1290</h3>
                    <span className={`grade-badge ${isPeriodoCerrado ? 'bajo' : 'superior'}`}>
                      {isPeriodoCerrado ? 'Periodo Cerrado' : 'Periodo Abierto'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Ponderación Oficial: Saber/Cognitivo (40%) + Hacer/Procedimental (30%) + Ser/Actitudinal (30%)
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: '220px', fontWeight: 600 }}
                    value={selectedCargaId}
                    onChange={(e) => handleSeleccionarCargaOPeriodo(Number(e.target.value), selectedPeriodoId)}
                  >
                    {cargas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.materia} — Grupo {c.grupo}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: '175px', fontWeight: 600 }}
                    value={selectedPeriodoId}
                    onChange={(e) => handleSeleccionarCargaOPeriodo(selectedCargaId, Number(e.target.value))}
                  >
                    {periodos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.cerrado ? '(Cerrado)' : '(Activo)'}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn-primary-action"
                    onClick={() => void handleSaveGrades()}
                    disabled={saving || isPeriodoCerrado}
                  >
                    <Save size={15} />
                    <span>{saving ? 'Guardando...' : 'Guardar Planilla'}</span>
                  </button>
                </div>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th style={{ width: '105px' }}>Saber (40%)</th>
                      <th style={{ width: '105px' }}>Hacer (30%)</th>
                      <th style={{ width: '105px' }}>Ser (30%)</th>
                      <th>Definitiva</th>
                      <th>Desempeño</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRows.map((s) => (
                      <tr key={s.estudianteId}>
                        <td>
                          <code style={{ background: 'var(--ec-surface-low)', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                            {s.codigo}
                          </code>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{s.nombre}</td>
                        <td><span className="grade-badge alto">{s.grupo}</span></td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={s.cognitiva}
                            onChange={(e) => handleGradeChange(s.estudianteId, 'cognitiva', e.target.value)}
                            className="form-input"
                            style={{ width: '78px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={s.procedimental}
                            onChange={(e) => handleGradeChange(s.estudianteId, 'procedimental', e.target.value)}
                            className="form-input"
                            style={{ width: '78px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={s.actitudinal}
                            onChange={(e) => handleGradeChange(s.estudianteId, 'actitudinal', e.target.value)}
                            className="form-input"
                            style={{ width: '78px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <span
                            className={`grade-badge ${
                              s.desempeno === 'SUPERIOR'
                                ? 'superior'
                                : s.desempeno === 'ALTO'
                                ? 'alto'
                                : s.desempeno === 'BASICO'
                                ? 'basico'
                                : 'bajo'
                            }`}
                          >
                            {s.definitiva.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ec-text)' }}>{s.desempeno}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '0.32rem 0.65rem', fontSize: '0.76rem', color: 'var(--ec-primary)' }}
                              onClick={() =>
                                setBoletinTarget({
                                  estudianteId: s.estudianteId,
                                  estudianteNombre: s.nombre,
                                  estudianteDocumento: '',
                                  estudianteCodigo: s.codigo,
                                  grupo: s.grupo,
                                })
                              }
                            >
                              <FileText size={12} /> Boletín
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              style={{ padding: '0.32rem 0.65rem', fontSize: '0.76rem', color: 'var(--ec-warning)', borderColor: 'var(--ec-warning-border)' }}
                              onClick={() => setSolicitudModalRow(s)}
                              title="Solicitar autorización a Rectoría para cambio de nota"
                            >
                              Solicitar Cambio
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: ASISTENCIA A CLASE */}
          {currentTab === 'asistencia_materia' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Control de Asistencia a Clase</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Asignatura: <strong>{cargaSeleccionadaObj?.materia} ({cargaSeleccionadaObj?.grupo})</strong> — Haz clic sobre el estado para alternar.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-primary-action"
                  disabled={saving}
                  onClick={() => void handleGuardarAsistencia()}
                >
                  <Save size={15} />
                  <span>{saving ? 'Guardando...' : 'Guardar Asistencia en Servidor'}</span>
                </button>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estudiante</th>
                      <th>Grupo</th>
                      <th>Estado de Asistencia Hoy</th>
                      <th>Fallas Históricas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRows.map((a) => {
                      const estado = asistenciaMap[a.matriculaId] || 'PRESENTE';
                      const fallasPrevias = asistenciaHistory.filter(
                        (h) => h.estudianteId === a.estudianteId && h.estado === 'AUSENTE'
                      ).length;

                      const tone =
                        estado === 'PRESENTE'
                          ? { bg: 'var(--ec-success-bg)', border: 'var(--ec-success-border)', color: 'var(--ec-success)', label: 'Presente en Aula' }
                          : estado === 'TARDE'
                          ? { bg: 'var(--ec-warning-bg)', border: 'var(--ec-warning-border)', color: 'var(--ec-warning)', label: 'Retardo' }
                          : estado === 'EXCUSA_MEDICA'
                          ? { bg: 'var(--ec-info-bg)', border: 'var(--ec-info-border)', color: 'var(--ec-info)', label: 'Excusa Médica' }
                          : { bg: 'var(--ec-danger-bg)', border: 'var(--ec-danger-border)', color: 'var(--ec-danger)', label: 'Inasistencia' };

                      return (
                        <tr key={a.matriculaId}>
                          <td>
                            <code style={{ background: 'var(--ec-surface-low)', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                              {a.codigo}
                            </code>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{a.nombre}</td>
                          <td><span className="grade-badge alto">{a.grupo}</span></td>
                          <td>
                            <button
                              type="button"
                              onClick={() => toggleAsistenciaEstado(a.matriculaId)}
                              style={{
                                background: tone.bg,
                                border: `1px solid ${tone.border}`,
                                color: tone.color,
                                padding: '0.42rem 0.9rem',
                                borderRadius: '9px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                              }}
                            >
                              {tone.label}
                            </button>
                          </td>
                          <td>{fallasPrevias} inasistencias</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: SOLICITUDES DE CAMBIO DE NOTA */}
          {currentTab === 'solicitudes_nota' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Solicitudes de Modificación de Calificación ante Rectoría</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Trazabilidad de solicitudes enviadas cuando un periodo académico se encuentra cerrado.
                  </p>
                </div>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Asignatura</th>
                      <th>Periodo</th>
                      <th>Nota Anterior</th>
                      <th>Nueva Definitiva</th>
                      <th>Motivo</th>
                      <th>Estado Rectoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesNota.map((sol) => (
                      <tr key={sol.id}>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{sol.estudianteNombre}</td>
                        <td>{sol.materiaNombre}</td>
                        <td>{sol.periodo}</td>
                        <td>{sol.notaAnterior.toFixed(2)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--ec-primary)' }}>{sol.notaNueva.toFixed(2)}</td>
                        <td style={{ maxWidth: '260px', fontSize: '0.85rem' }}>{sol.motivo}</td>
                        <td>
                          <span
                            className={`grade-badge ${
                              sol.estado === 'APROBADA' ? 'superior' : sol.estado === 'RECHAZADA' ? 'bajo' : 'basico'
                            }`}
                          >
                            {sol.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: CONSOLIDADO DIRECCIÓN DE GRUPO */}
          {esDirectorGrupo && currentTab === 'grupo_consolidado' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3>Consolidado Académico Integral — Grupo {grupoDireccion}</h3>
                    <span className="grade-badge superior">{alumnosDireccionGrupo.length} Estudiantes</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Promedio acumulado calculado desde todas las asignaturas calificadas en PostgreSQL.
                  </p>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search
                    size={15}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ec-text-subtle)' }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    className="form-input"
                    style={{ paddingLeft: '32px', width: '220px' }}
                    value={searchGrupoEst}
                    onChange={(e) => setSearchGrupoEst(e.target.value)}
                  />
                </div>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estudiante</th>
                      <th>Documento</th>
                      <th>Promedio General</th>
                      <th>Materias en Riesgo (&lt; 3.0)</th>
                      <th>Acciones Director de Grupo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnosDireccionGrupo
                      .filter(
                        (a) =>
                          a.nombreCompleto.toLowerCase().includes(searchGrupoEst.toLowerCase()) ||
                          a.codigoEstudiantil.toLowerCase().includes(searchGrupoEst.toLowerCase())
                      )
                      .map((a) => {
                        const notasAlumno = calificacionesAll.filter((c) => c.estudianteId === a.estudianteId);
                        const prom =
                          notasAlumno.length > 0
                            ? notasAlumno.reduce((acc, c) => acc + c.notaDefinitivaPeriodo, 0) / notasAlumno.length
                            : 0;
                        const perdidas = notasAlumno.filter((c) => c.notaDefinitivaPeriodo < 3.0).length;

                        return (
                          <tr key={a.estudianteId}>
                            <td>
                              <code style={{ background: 'var(--ec-surface-low)', padding: '0.2rem 0.45rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                                {a.codigoEstudiantil}
                              </code>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{a.nombreCompleto}</td>
                            <td>{a.documento}</td>
                            <td>
                              <span className={`grade-badge ${prom >= 4.0 ? 'superior' : prom >= 3.0 ? 'basico' : 'bajo'}`}>
                                {prom.toFixed(2)}
                              </span>
                            </td>
                            <td>
                              {perdidas === 0 ? (
                                <span className="grade-badge superior">Al día (0 materias)</span>
                              ) : (
                                <span className="grade-badge bajo">{perdidas} en nivelación</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="btn-secondary-action"
                                  style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem', color: 'var(--ec-primary)' }}
                                  onClick={() =>
                                    setBoletinTarget({
                                      estudianteId: a.estudianteId,
                                      estudianteNombre: a.nombreCompleto,
                                      estudianteDocumento: a.documento,
                                      estudianteCodigo: a.codigoEstudiantil,
                                      grupo: a.grupo,
                                    })
                                  }
                                >
                                  Boletín Oficial
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary-action"
                                  style={{ padding: '0.32rem 0.65rem', fontSize: '0.78rem' }}
                                  onClick={() => {
                                    setCitacionAlumno(a.nombreCompleto);
                                    setCitacionModal(true);
                                  }}
                                >
                                  Citar Acudiente
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 5: OBSERVADOR DEL ESTUDIANTE */}
          {esDirectorGrupo && currentTab === 'grupo_observador' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Observador del Estudiante y Convivencia Escolar</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Anotaciones formativas, felicitaciones y debido proceso Ley 1620.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => {
                    setSelectedAlumnoObs(alumnosDireccionGrupo[0]?.nombreCompleto || '');
                    setAnotacionModal(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Nueva Anotación</span>
                </button>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estudiante</th>
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
                        <td><span className="grade-badge alto">{o.tipo}</span></td>
                        <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{o.descripcion}</td>
                        <td style={{ maxWidth: '240px', fontSize: '0.85rem', color: 'var(--ec-text-muted)' }}>{o.compromisos}</td>
                        <td>
                          <span className={`grade-badge ${o.firmadoEstudiante || o.firmadoAcudiente ? 'superior' : 'basico'}`}>
                            {o.firmadoEstudiante || o.firmadoAcudiente ? 'Firmado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 6: CITACIONES A ACUDIENTES */}
          {esDirectorGrupo && currentTab === 'grupo_citaciones' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Citaciones a Padres de Familia</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Agenda de atención a padres y seguimiento de comparecencia.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => {
                    setCitacionAlumno(alumnosDireccionGrupo[0]?.nombreCompleto || '');
                    setCitacionModal(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Programar Citación</span>
                </button>
              </div>

              <div className="ec-table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Acudiente</th>
                      <th>Fecha y Hora</th>
                      <th>Motivo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citaciones.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: 'var(--ec-text)' }}>{c.estudianteNombre}</td>
                        <td>{c.acudiente}</td>
                        <td style={{ color: 'var(--ec-primary)', fontWeight: 600 }}>{c.fecha} — {c.hora}</td>
                        <td>{c.motivo}</td>
                        <td><span className="grade-badge superior">{c.estado}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 7: HORARIO SEMANAL */}
          {currentTab === 'horario' && (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Programación y Horario de Clases</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--ec-text-muted)', marginTop: '0.2rem' }}>
                    Alterna entre tus clases asignadas o el horario completo de tu grupo.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setVistaHorarioDocente('mis_clases')}
                    className={vistaHorarioDocente === 'mis_clases' ? 'btn-primary-action' : 'btn-secondary-action'}
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
                  >
                    <BookOpen size={14} /> Mis Clases
                  </button>
                  <button
                    type="button"
                    onClick={() => setVistaHorarioDocente('grupo_completo')}
                    className={vistaHorarioDocente === 'grupo_completo' ? 'btn-primary-action' : 'btn-secondary-action'}
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
                  >
                    <Users size={14} /> Grupo {grupoDireccion}
                  </button>
                </div>
              </div>

              <div className="panel-body">
                <HorarioSemanalGrid
                  bloques={
                    vistaHorarioDocente === 'mis_clases'
                      ? horarios.filter(
                          (h) =>
                            (user?.docenteId && h.docenteId === user.docenteId) ||
                            h.docente.toLowerCase().includes((user?.primerApellido || '').toLowerCase())
                        )
                      : horarios.filter((h) => h.grupo.toLowerCase().includes(grupoDireccion.toLowerCase()))
                  }
                  editable={false}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL SOLICITUD MODIFICACIÓN DE NOTA */}
      {solicitudModalRow && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '520px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>Solicitar Cambio de Nota a Rectoría</h3>
              <button type="button" onClick={() => setSolicitudModalRow(null)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleEnviarSolicitudCambioNota}>
                <p style={{ fontSize: '0.86rem', color: 'var(--ec-text-secondary)', marginBottom: '1rem' }}>
                  Estudiante: <strong>{solicitudModalRow.nombre}</strong> — Nueva Definitiva Propuesta: <strong>{solicitudModalRow.definitiva.toFixed(2)}</strong>
                </p>
                <label className="form-label">Motivo de la corrección *</label>
                <textarea
                  rows={3}
                  required
                  className="form-input"
                  placeholder="Justifique pedagógicamente el motivo de la corrección o nivelación..."
                  value={motivoSolicitud}
                  onChange={(e) => setMotivoSolicitud(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setSolicitudModalRow(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">
                    Radicar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANOTACIÓN OBSERVADOR */}
      {anotacionModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '540px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>Nueva Anotación en Observador</h3>
              <button type="button" onClick={() => setAnotacionModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleCrearAnotacion} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div>
                  <label className="form-label">Estudiante</label>
                  <select
                    className="form-input"
                    value={selectedAlumnoObs}
                    onChange={(e) => setSelectedAlumnoObs(e.target.value)}
                    required
                  >
                    {estudiantesAsociados.map((e) => (
                      <option key={e.estudianteId} value={e.nombreCompleto}>
                        {e.nombreCompleto} ({e.grupo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tipo de anotación</label>
                  <select className="form-input" value={tipoAnotacion} onChange={(e) => setTipoAnotacion(e.target.value)}>
                    <option value="FORMATIVA">Anotación Formativa</option>
                    <option value="FELICITACION">Felicitación Académica</option>
                    <option value="CONVIVENCIA">Llamado de Atención (Ley 1620)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Descripción *</label>
                  <textarea
                    rows={3}
                    required
                    className="form-input"
                    placeholder="Descripción objetiva de la observación..."
                    value={descAnotacion}
                    onChange={(e) => setDescAnotacion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Compromiso pedagógico</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Compromiso pedagógico del estudiante..."
                    value={compromisoAnotacion}
                    onChange={(e) => setCompromisoAnotacion(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setAnotacionModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">
                    Guardar en Observador
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CITACIÓN ACUDIENTE */}
      {citacionModal && (
        <div className="ec-modal-overlay">
          <div className="ec-modal-card" style={{ maxWidth: '520px' }}>
            <div className="ec-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800 }}>Citación Oficial a Acudiente</h3>
              <button type="button" onClick={() => setCitacionModal(false)} className="btn-secondary-action" style={{ padding: '0.35rem' }}>
                <X size={18} />
              </button>
            </div>
            <div className="ec-modal-body">
              <form onSubmit={handleCrearCitacion} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                <div>
                  <label className="form-label">Estudiante *</label>
                  <input type="text" className="form-input" value={citacionAlumno} onChange={(e) => setCitacionAlumno(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label className="form-label">Fecha *</label>
                    <input type="date" className="form-input" value={citacionFecha} onChange={(e) => setCitacionFecha(e.target.value)} required />
                  </div>
                  <div>
                    <label className="form-label">Hora *</label>
                    <input type="time" className="form-input" value={citacionHora} onChange={(e) => setCitacionHora(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Motivo *</label>
                  <textarea
                    rows={3}
                    required
                    className="form-input"
                    value={citacionMotivo}
                    onChange={(e) => setCitacionMotivo(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary-action" onClick={() => setCitacionModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary-action">
                    Enviar Citación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BOLETÍN OFICIAL DECRETO 1290 */}
      {boletinTarget && (
        <BoletinOficialModal
          isOpen={true}
          onClose={() => setBoletinTarget(null)}
          estudianteId={boletinTarget.estudianteId}
          estudianteNombre={boletinTarget.estudianteNombre}
          estudianteDocumento={boletinTarget.estudianteDocumento}
          estudianteCodigo={boletinTarget.estudianteCodigo}
          grupo={boletinTarget.grupo}
          periodo={periodoSeleccionadoObj?.nombre || 'Primer Periodo 2026'}
          calificaciones={calificacionesAll
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

export default DocenteDashboard;
