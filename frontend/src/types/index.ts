export type Role =
  | 'ADMIN'
  | 'RECTOR'
  | 'COORDINADOR'
  | 'DIRECTOR_GRUPO'
  | 'DOCENTE'
  | 'ESTUDIANTE'
  | 'TUTOR'
  | 'ADMINISTRATIVO';

export interface User {
  id: number;
  email: string;
  documento: string;
  primerNombre: string;
  primerApellido: string;
  nombreCompleto: string;
  rol: Role;
  token: string;
  grupoAsignado?: string;
  grupoAsignadoId?: number;
  esDirectorGrupo?: boolean;
  docenteId?: number;
  estudianteId?: number;
  tutorId?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  totalEstudiantes: number;
  totalDocentes: number;
  totalGrupos: number;
  totalMaterias: number;
  totalUsuarios: number;
  totalTutores: number;
  promedioInstitucional: number;
  porcentajeAsistencia: number;
  alertasRiesgo: number;
  solicitudesPendientes: number;
}

export interface UsuarioDto {
  id: number;
  tipoDocumento: string;
  documento: string;
  email: string;
  rol: Role;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
  grupo?: string;
  grupoId?: number;
  especialidad?: string;
  ultimoAcceso?: string;
  fechaCreacion?: string;
}

export interface GrupoDto {
  id: number;
  nombre: string;
  codigoGrupo: string;
  grado: string;
  gradoId: number;
  nivel: string;
  director: string;
  directorNombre: string;
  directorGrupoId?: number;
  salon: string;
  salonAula: string;
  jornada: string;
  cupoMaximo: number;
  estudiantes: number;
  totalEstudiantes: number;
  anioLectivo: number;
}

export interface MateriaDto {
  id: number;
  codigo: string;
  codigoOficial: string;
  nombre: string;
  area: string;
  areaConocimiento: string;
  intensidadHoraria: number;
  horasSemanales: number;
  descripcion?: string;
  activa: boolean;
  docente: string;
  grupos: string;
}

export interface CargaAcademicaDto {
  id: number;
  grupoId: number;
  grupo: string;
  materiaId: number;
  materia: string;
  area?: string;
  docenteId: number;
  docenteUsuarioId?: number;
  docente: string;
  intensidadHoraria: number;
}

export interface PeriodoAcademicoDto {
  id: number;
  numeroPeriodo: number;
  nombre: string;
  porcentajeValor: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCierreNotas: string;
  cerrado: boolean;
}

export interface CalificacionDto {
  id: number;
  matriculaId: number;
  estudianteId: number;
  estudianteUsuarioId?: number;
  estudianteNombre: string;
  documentoEstudiante?: string;
  grupoId: number;
  grupo: string;
  cargaAcademicaId: number;
  materiaId: number;
  materia: string;
  area: string;
  intensidadHoraria: number;
  docente: string;
  periodoId: number;
  numeroPeriodo: number;
  periodoNombre: string;
  periodoCerrado: boolean;
  notaCognitiva: number;
  notaProcedimental: number;
  notaActitudinal: number;
  nota1: number;
  nota2: number;
  nota3: number;
  notaDefinitivaPeriodo: number;
  notaFinal: number;
  definitiva: number;
  escalaDesempeno: 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO';
  desempeno: string;
  juicioValorativo?: string;
  observaciones?: string;
  planMejoramiento?: string;
}

export interface SolicitudNotaDto {
  id: number;
  calificacionId?: number;
  docente: string;
  estudiante: string;
  estudianteNombre: string;
  materia: string;
  materiaNombre: string;
  grupo: string;
  periodo: string;
  notaAnterior: number;
  notaNueva: number;
  notaNuevaCognitiva: number;
  notaNuevaProcedimental: number;
  notaNuevaActitudinal: number;
  motivo: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  comentarioResolucion?: string;
  fecha: string;
}

export interface AsistenciaDto {
  id: number;
  matriculaId: number;
  estudianteId: number;
  estudianteNombre: string;
  estudiante: string;
  grupo: string;
  cargaAcademicaId: number;
  materiaId: number;
  materia: string;
  fecha: string;
  fechaClase: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'EXCUSA_MEDICA' | 'PERMISO_INSTITUCIONAL';
  estadoAsistencia: string;
  minutosRetraso?: number;
  observacion?: string;
  justificada: boolean;
}

export interface JustificacionDto {
  id: number;
  asistenciaId: number;
  estudiante: string;
  estudianteNombre: string;
  grupo: string;
  materia: string;
  fechaInasistencia: string;
  fecha: string;
  acudiente: string;
  motivo: string;
  tipo: string;
  soporte?: string;
  estado: 'PENDIENTE_REVISION' | 'APROBADA_COORDINACION' | 'RECHAZADA';
  observacionCoordinacion?: string;
}

export interface HorarioBloqueDto {
  id: number;
  grupoId: number;
  grupo: string;
  materiaId: number;
  materia: string;
  docenteId: number;
  docente: string;
  dia: string;
  diaSemana: string;
  bloqueOrden: number;
  horaInicio: string;
  horaFin: string;
  hora: string;
  aula: string;
}

export interface ComunicadoDto {
  id: number;
  titulo: string;
  contenido: string;
  mensaje: string;
  autor: string;
  rolAutor: string;
  destinatarios: string;
  destinatarioRol: string;
  prioridad: string;
  importancia: string;
  fecha: string;
}

export interface ObservacionDto {
  id: number;
  matriculaId: number;
  estudianteId: number;
  estudiante: string;
  estudianteNombre: string;
  grupo: string;
  autor: string;
  periodo: string;
  fecha: string;
  tipo: string;
  tipoAnotacion: string;
  categoriaFalta: string;
  descripcion: string;
  descripcionHechos: string;
  descargos?: string;
  compromisos: string;
  firmadoEstudiante: boolean;
  firmadoAcudiente: boolean;
}

export interface CitacionDto {
  id: number;
  estudianteId: number;
  estudiante: string;
  estudianteNombre: string;
  acudiente: string;
  convocadoPor: string;
  docente: string;
  fecha: string;
  hora: string;
  lugar: string;
  motivo: string;
  modalidad: string;
  estado: string;
  compromisosActa?: string;
}

export interface CasoConvivenciaDto {
  id: number;
  radicado: string;
  matriculaId: number;
  estudiante: string;
  estudianteNombre: string;
  grupo: string;
  tipoSituacion: string;
  tipoFalta: string;
  severidad: string;
  descripcion: string;
  descripcionSuceso: string;
  medidaPedagogica: string;
  accionTomada: string;
  estado: string;
  remitidoComite: boolean;
  reportadoPor: string;
  fecha: string;
}

export interface ResolucionDto {
  id: number;
  numero: string;
  numeroResolucion: string;
  titulo: string;
  considerando: string;
  resuelve: string;
  descripcion: string;
  emitidoPor: string;
  fecha: string;
  estado: string;
  vigente: boolean;
}

export interface BoletinOficialDto {
  folioMatricula: string;
  estudianteId: number;
  estudianteNombre: string;
  documento: string;
  codigoEstudiantil: string;
  grupo: string;
  grado: string;
  jornada: string;
  directorGrupo: string;
  anioLectivo: number;
  periodo: string;
  promedioGeneral: number;
  escalaGlobal: string;
  puestoCurso: number;
  totalEstudiantesCurso: number;
  fallasInjustificadas: number;
  fallasJustificadas: number;
  codigoVerificacion: string;
  fechaEmision: string;
  asignaturas: CalificacionDto[];
}

export interface AlertaMipaDto {
  id: number;
  matriculaId: number;
  estudianteId: number;
  estudiante: string;
  documento: string;
  grupo: string;
  promedio: number;
  inasistencias: number;
  indiceRiesgo: number;
  puntajeRiesgo: number;
  nivelRiesgo: 'CRITICO' | 'ALTO' | 'MODERADO' | 'BAJO';
  nivelAlerta: string;
  factores: string[];
  factoresDetectados: string;
  recomendacion: string;
  atendidoOrientacion: boolean;
}
