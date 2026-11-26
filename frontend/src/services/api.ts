import { httpClient, setStoredToken } from './api/httpClient';
import {
  AlertaMipaDto,
  AsistenciaDto,
  BoletinOficialDto,
  CalificacionDto,
  CargaAcademicaDto,
  CasoConvivenciaDto,
  CitacionDto,
  ComunicadoDto,
  DashboardStats,
  GrupoDto,
  HorarioBloqueDto,
  JustificacionDto,
  MateriaDto,
  ObservacionDto,
  PeriodoAcademicoDto,
  ResolucionDto,
  Role,
  SolicitudNotaDto,
  User,
  UsuarioDto,
} from '../types';

interface CalificacionPayload {
  matriculaId?: number;
  estudianteId?: number;
  cargaAcademicaId: number;
  periodoId: number;
  notaCognitiva: number;
  notaProcedimental: number;
  notaActitudinal: number;
  juicioValorativo?: string;
  planMejoramiento?: string;
}

export interface UsuarioCreatePayload {
  tipoDocumento?: string;
  documento: string;
  email: string;
  password?: string;
  rol: string;
  nombre?: string;
  apellido?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  telefono?: string;
  direccion?: string;
  estado?: boolean;
  grupoId?: number;
  grupoCodigo?: string;
  especialidad?: string;
  tituloProfesional?: string;
}

function normalizeUserResponse(raw: Record<string, unknown>): User {
  const rolNorm = String(raw.rol || 'ESTUDIANTE').toUpperCase() as Role;
  const primerNombre = String(raw.primerNombre || raw.nombre || 'Usuario');
  const primerApellido = String(raw.primerApellido || raw.apellido || '');
  const nombreCompleto = String(raw.nombreCompleto || `${primerNombre} ${primerApellido}`.trim());
  const token = String(raw.token || '');

  if (token) {
    setStoredToken(token);
  }

  return {
    id: Number(raw.id),
    email: String(raw.email || ''),
    documento: String(raw.documento || ''),
    primerNombre,
    primerApellido,
    nombreCompleto,
    rol: rolNorm,
    token,
    grupoAsignado: raw.grupoAsignado ? String(raw.grupoAsignado) : undefined,
    grupoAsignadoId: raw.grupoAsignadoId ? Number(raw.grupoAsignadoId) : undefined,
    esDirectorGrupo: Boolean(raw.esDirectorGrupo),
    docenteId: raw.docenteId ? Number(raw.docenteId) : undefined,
    estudianteId: raw.estudianteId ? Number(raw.estudianteId) : undefined,
    tutorId: raw.tutorId ? Number(raw.tutorId) : undefined,
  };
}

export const api = {
  // ===========================================================================
  // 1. AUTENTICACIÓN Y RECUPERACIÓN DE CONTRASEÑA (100% SPRING BOOT + BCRYPT + JWT)
  // ===========================================================================
  async login(email: string, password: string): Promise<User> {
    const res = await httpClient.post<Record<string, unknown>>('/auth/login', {
      email: email.trim(),
      password,
    });
    return normalizeUserResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await httpClient.get<Record<string, unknown>>('/auth/me');
    return normalizeUserResponse(res);
  },

  async register(data: Record<string, unknown>): Promise<User> {
    const res = await httpClient.post<Record<string, unknown>>('/auth/register', data);
    return normalizeUserResponse(res);
  },

  async solicitarRecuperacion(email: string) {
    return httpClient.post<{ success: boolean; mensaje: string }>('/auth/olvide-password', {
      email: email.trim().toLowerCase(),
    });
  },

  async verificarCodigoRecuperacion(email: string, codigo: string): Promise<boolean> {
    const res = await httpClient.post<{ valido: boolean }>('/auth/verificar-codigo', {
      email: email.trim().toLowerCase(),
      codigo: codigo.trim(),
    });
    return Boolean(res.valido);
  },

  async restablecerPassword(email: string, codigo: string, nuevaPassword: string) {
    return httpClient.post<{ success: boolean; mensaje: string }>('/auth/restablecer-password', {
      email: email.trim().toLowerCase(),
      codigo: codigo.trim(),
      nuevaPassword,
    });
  },

  // ===========================================================================
  // 2. ADMINISTRACIÓN, USUARIOS, GRUPOS, MATERIAS Y CARGA ACADÉMICA
  // ===========================================================================
  async getAdminStats(): Promise<DashboardStats> {
    return httpClient.get<DashboardStats>('/admin/stats');
  },

  async getUsuarios(): Promise<UsuarioDto[]> {
    return httpClient.get<UsuarioDto[]>('/admin/usuarios');
  },

  async crearUsuarioAdmin(user: UsuarioCreatePayload): Promise<UsuarioDto> {
    return httpClient.post<UsuarioDto>('/admin/usuarios', user);
  },

  async actualizarUsuarioAdmin(id: number | string, data: Partial<UsuarioCreatePayload>): Promise<UsuarioDto> {
    return httpClient.put<UsuarioDto>(`/admin/usuarios/${id}`, data);
  },

  async eliminarUsuarioAdmin(id: number | string) {
    return httpClient.delete<{ id: number; estado: boolean; mensaje: string }>(`/admin/usuarios/${id}`);
  },

  async getGrados() {
    return httpClient.get<Array<{ id: number; nombre: string; nivel: string; numeroOrden: number }>>('/admin/grados');
  },

  async getGruposAdmin(): Promise<GrupoDto[]> {
    return httpClient.get<GrupoDto[]>('/admin/grupos');
  },

  async getGrupos(): Promise<GrupoDto[]> {
    return httpClient.get<GrupoDto[]>('/admin/grupos');
  },

  async crearGrupo(data: Record<string, unknown>): Promise<GrupoDto> {
    return httpClient.post<GrupoDto>('/admin/grupos', data);
  },

  async actualizarGrupo(id: number | string, data: Record<string, unknown>): Promise<GrupoDto> {
    return httpClient.put<GrupoDto>(`/admin/grupos/${id}`, data);
  },

  async eliminarGrupo(id: number | string) {
    return httpClient.delete<{ mensaje: string }>(`/admin/grupos/${id}`);
  },

  async getMateriasAdmin(): Promise<MateriaDto[]> {
    return httpClient.get<MateriaDto[]>('/admin/materias');
  },

  async getMaterias(): Promise<MateriaDto[]> {
    return httpClient.get<MateriaDto[]>('/admin/materias');
  },

  async crearMateria(data: Record<string, unknown>): Promise<MateriaDto> {
    return httpClient.post<MateriaDto>('/admin/materias', data);
  },

  async actualizarMateria(id: number | string, data: Record<string, unknown>): Promise<MateriaDto> {
    return httpClient.put<MateriaDto>(`/admin/materias/${id}`, data);
  },

  async getCargasAcademicas(): Promise<CargaAcademicaDto[]> {
    return httpClient.get<CargaAcademicaDto[]>('/admin/cargas');
  },

  async crearCargaAcademica(data: Record<string, unknown>): Promise<CargaAcademicaDto> {
    return httpClient.post<CargaAcademicaDto>('/admin/cargas', data);
  },

  async eliminarCargaAcademica(id: number | string) {
    return httpClient.delete<{ mensaje: string }>(`/admin/cargas/${id}`);
  },

  async getPeriodosConfig(): Promise<PeriodoAcademicoDto[]> {
    return httpClient.get<PeriodoAcademicoDto[]>('/admin/periodos');
  },

  // ===========================================================================
  // 3. RECTORÍA Y GOBIERNO ESCOLAR
  // ===========================================================================
  async getRectorResumen() {
    return httpClient.get<Record<string, unknown>>('/rector/resumen');
  },

  async getResolucionesRector(): Promise<ResolucionDto[]> {
    return httpClient.get<ResolucionDto[]>('/rector/resoluciones');
  },

  async crearResolucionRector(data: Record<string, unknown>): Promise<ResolucionDto> {
    return httpClient.post<ResolucionDto>('/rector/resoluciones', data);
  },

  async togglePeriodoCerrado(periodoId: number | string, cerrado: boolean) {
    return httpClient.put<Record<string, unknown>>(`/rector/periodos/${periodoId}/estado`, { cerrado });
  },

  async getSolicitudesCambioNota(): Promise<SolicitudNotaDto[]> {
    return httpClient.get<SolicitudNotaDto[]>('/calificaciones/solicitudes');
  },

  async crearSolicitudCambioNota(data: Record<string, unknown>): Promise<SolicitudNotaDto> {
    return httpClient.post<SolicitudNotaDto>('/calificaciones/solicitudes', data);
  },

  async resolverSolicitudCambioNota(id: number | string, estado: 'APROBADA' | 'RECHAZADA', comentario?: string): Promise<SolicitudNotaDto> {
    return httpClient.put<SolicitudNotaDto>(`/rector/solicitudes-notas/${id}`, {
      estado,
      comentario: comentario || `Resolución ejecutiva: ${estado}`,
    });
  },

  async getActasPromocion() {
    return httpClient.get<Array<Record<string, unknown>>>('/rector/promocion');
  },

  // ===========================================================================
  // 4. CALIFICACIONES DECRETO 1290 (40% SABER, 30% HACER, 30% SER)
  // ===========================================================================
  async getCalificaciones(params?: {
    cargaAcademicaId?: number;
    periodoId?: number;
    estudianteId?: number;
    grupoId?: number;
  }): Promise<CalificacionDto[]> {
    const query = new URLSearchParams();
    if (params?.cargaAcademicaId) query.set('cargaAcademicaId', String(params.cargaAcademicaId));
    if (params?.periodoId) query.set('periodoId', String(params.periodoId));
    if (params?.estudianteId) query.set('estudianteId', String(params.estudianteId));
    if (params?.grupoId) query.set('grupoId', String(params.grupoId));
    const qs = query.toString();
    return httpClient.get<CalificacionDto[]>(`/calificaciones${qs ? `?${qs}` : ''}`);
  },

  async getCalificacionesEstudiante(estudianteId?: number | string): Promise<CalificacionDto[]> {
    const qs = estudianteId ? `?estudianteId=${encodeURIComponent(String(estudianteId))}` : '';
    return httpClient.get<CalificacionDto[]>(`/calificaciones${qs}`);
  },

  async guardarPlanillaCalificaciones(registros: CalificacionPayload[]): Promise<CalificacionDto[]> {
    return httpClient.post<CalificacionDto[]>('/calificaciones/planilla', { registros });
  },

  // ===========================================================================
  // 5. ASISTENCIA DIARIA Y JUSTIFICACIONES DE INASISTENCIA
  // ===========================================================================
  async getAsistencias(params?: {
    estudianteId?: number | string;
    cargaAcademicaId?: number;
    fecha?: string;
  }): Promise<AsistenciaDto[]> {
    const query = new URLSearchParams();
    if (params?.estudianteId) query.set('estudianteId', String(params.estudianteId));
    if (params?.cargaAcademicaId) query.set('cargaAcademicaId', String(params.cargaAcademicaId));
    if (params?.fecha) query.set('fecha', params.fecha);
    const qs = query.toString();
    return httpClient.get<AsistenciaDto[]>(`/asistencias${qs ? `?${qs}` : ''}`);
  },

  async getAsistenciasEstudiante(estudianteId?: number | string): Promise<AsistenciaDto[]> {
    return this.getAsistencias(estudianteId ? { estudianteId } : undefined);
  },

  async guardarPlanillaAsistencias(registros: Record<string, unknown>[]): Promise<AsistenciaDto[]> {
    return httpClient.post<AsistenciaDto[]>('/asistencias/planilla', { registros });
  },

  async getJustificaciones(): Promise<JustificacionDto[]> {
    return httpClient.get<JustificacionDto[]>('/asistencias/justificaciones');
  },

  async crearJustificacion(data: Record<string, unknown>): Promise<JustificacionDto> {
    return httpClient.post<JustificacionDto>('/asistencias/justificaciones', data);
  },

  async revisarJustificacion(id: number | string, estado: string, observacion?: string): Promise<JustificacionDto> {
    return httpClient.put<JustificacionDto>(`/asistencias/justificaciones/${id}`, {
      estado,
      observacion,
    });
  },

  // ===========================================================================
  // 6. HORARIOS ESCOLARES SEMANALES
  // ===========================================================================
  async getHorarios(grupo?: string, docenteId?: number): Promise<HorarioBloqueDto[]> {
    const query = new URLSearchParams();
    if (grupo && grupo !== 'TODOS') query.set('grupo', grupo);
    if (docenteId) query.set('docenteId', String(docenteId));
    const qs = query.toString();
    return httpClient.get<HorarioBloqueDto[]>(`/horarios${qs ? `?${qs}` : ''}`);
  },

  async crearBloqueHorario(data: Record<string, unknown>): Promise<HorarioBloqueDto> {
    return httpClient.post<HorarioBloqueDto>('/horarios', data);
  },

  async eliminarBloqueHorario(id: number | string) {
    return httpClient.delete<{ mensaje: string }>(`/horarios/${id}`);
  },

  // ===========================================================================
  // 7. COMUNICADOS, OBSERVADOR, CITACIONES, CONVIVENCIA Y BOLETINES
  // ===========================================================================
  async getComunicados(): Promise<ComunicadoDto[]> {
    return httpClient.get<ComunicadoDto[]>('/comunicados');
  },

  async crearComunicado(data: Record<string, unknown>): Promise<ComunicadoDto> {
    return httpClient.post<ComunicadoDto>('/comunicados', data);
  },

  async eliminarComunicado(id: number | string) {
    return httpClient.delete<{ mensaje: string }>(`/comunicados/${id}`);
  },

  async getObservaciones(estudianteId?: number | string): Promise<ObservacionDto[]> {
    const qs = estudianteId ? `?estudianteId=${encodeURIComponent(String(estudianteId))}` : '';
    return httpClient.get<ObservacionDto[]>(`/observador${qs}`);
  },

  async crearObservacion(data: Record<string, unknown>): Promise<ObservacionDto> {
    return httpClient.post<ObservacionDto>('/observador', data);
  },

  async firmarObservacion(id: number | string): Promise<ObservacionDto> {
    return httpClient.put<ObservacionDto>(`/observador/${id}/firmar`);
  },

  async getCitaciones(): Promise<CitacionDto[]> {
    return httpClient.get<CitacionDto[]>('/citaciones');
  },

  async crearCitacion(data: Record<string, unknown>): Promise<CitacionDto> {
    return httpClient.post<CitacionDto>('/citaciones', data);
  },

  async actualizarEstadoCitacion(id: number | string, estado: string, compromisosActa?: string): Promise<CitacionDto> {
    return httpClient.put<CitacionDto>(`/citaciones/${id}`, { estado, compromisosActa });
  },

  async getCasosConvivencia(): Promise<CasoConvivenciaDto[]> {
    return httpClient.get<CasoConvivenciaDto[]>('/convivencia');
  },

  async crearCasoConvivencia(data: Record<string, unknown>): Promise<CasoConvivenciaDto> {
    return httpClient.post<CasoConvivenciaDto>('/convivencia', data);
  },

  async actualizarCasoConvivencia(id: number | string, estado: string, medidaPedagogica?: string): Promise<CasoConvivenciaDto> {
    return httpClient.put<CasoConvivenciaDto>(`/convivencia/${id}`, { estado, medidaPedagogica });
  },

  async getBoletinOficial(estudianteId?: number | string, periodo?: number): Promise<BoletinOficialDto> {
    const query = new URLSearchParams();
    if (estudianteId) query.set('estudianteId', String(estudianteId));
    if (periodo) query.set('periodo', String(periodo));
    const qs = query.toString();
    return httpClient.get<BoletinOficialDto>(`/boletines${qs ? `?${qs}` : ''}`);
  },

  // ===========================================================================
  // 8. CONTEXTOS POR ROL (DOCENTE Y TUTOR) + TELEMETRÍA Y MOTOR MIPA
  // ===========================================================================
  async getContextoDocente() {
    return httpClient.get<{
      docenteId: number;
      nombreDocente: string;
      especialidad: string;
      esDirectorGrupo: boolean;
      grupoDireccion?: string;
      grupoDireccionId?: number;
      cargasAcademicas: CargaAcademicaDto[];
      estudiantesAsociados: Array<{
        matriculaId: number;
        estudianteId: number;
        usuarioId: number;
        documento: string;
        codigoEstudiantil: string;
        nombreCompleto: string;
        grupoId: number;
        grupo: string;
      }>;
    }>('/docente/contexto');
  },

  async getAcudidosTutor() {
    return httpClient.get<
      Array<{
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
      }>
    >('/tutor/acudidos');
  },

  async getTelemetriaResumen() {
    return httpClient.get<{
      estadoGeneral: string;
      motorBaseDatos: string;
      memoriaUsadaMb: number;
      memoriaTotalMb: number;
      usoMemoriaPorcentaje: number;
      tiempoActividadMinutos: number;
      totalEventosRegistrados: number;
      distribucionUsuariosPorRol: Record<string, number>;
      ultimosIngresos: Array<{
        id: number;
        usuario: string;
        email: string;
        rol: string;
        modulo: string;
        ip: string;
        dispositivo: string;
        fechaHora: string;
      }>;
    }>('/telemetria/resumen');
  },

  async getAlertasMipa(): Promise<AlertaMipaDto[]> {
    return httpClient.get<AlertaMipaDto[]>('/mipa/alertas-desercion');
  },

  async registrarIntervencionMipa(id: number | string, intervencion: string) {
    return httpClient.post<{ id: number; atendidoOrientacion: boolean; mensaje: string }>(
      `/mipa/${id}/intervenir`,
      { intervencion }
    );
  },
};
