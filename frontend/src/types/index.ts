export type Rol =
  | 'ADMIN'
  | 'RECTOR'
  | 'COORDINADOR'
  | 'DIRECTOR_GRUPO'
  | 'DOCENTE'
  | 'ESTUDIANTE'
  | 'TUTOR'
  | 'ADMINISTRATIVO'
  | 'admin'
  | 'rector'
  | 'coordinador'
  | 'director_grupo'
  | 'docente'
  | 'estudiante'
  | 'tutor'
  | 'administrativo';

export interface Usuario {
  id: number;
  email: string;
  rol: Rol;
  nombre?: string;
  apellido?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  avatarUrl?: string;
  nombreCompleto: string;
  activo: boolean;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  id: number;
  email: string;
  rol: 'ADMIN' | 'RECTOR' | 'COORDINADOR' | 'DIRECTOR_GRUPO' | 'DOCENTE' | 'ESTUDIANTE' | 'TUTOR';
  nombreCompleto: string;
  avatarUrl?: string;
  perfilId?: number;
}

export interface Tutor {
  id: number;
  tipoDocumento?: string;
  numeroDocumento?: string;
  nombres?: string;
  apellidos?: string;
  telefonoPrincipal?: string;
  telefonoSecundario?: string;
  correo?: string;
  direccionResidencia?: string;
  ocupacion?: string;
  lugarTrabajo?: string;
}

export interface Estudiante {
  id: number;
  codigoEstudiantil?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  genero?: string;
  tipoSangreRh?: string;
  epsSeguroMedico?: string;
  alergiasCondicionesMedicas?: string;
  direccionResidencia?: string;
  estado?: string;
}

export interface Materia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  areaConocimiento?: string;
  horasSemanales?: number;
  intensidad_horaria?: number;
  docente_id?: number;
  docenteNombre?: string;
}

export interface ActaComisionEvaluacion {
  id: number;
  numeroActa?: string;
  periodo: number;
  fecha: string;
  grado: string;
  grupoNombre?: string;
  estudiantesEnRiesgo: number;
  estudianteNombre?: string;
  materiasReprobadas?: string[];
  motivo: string;
  acuerdosPedagogicos: string;
  planMejoramiento?: string;
  compromisoAcudiente?: string;
  coordinadorFirma?: string;
  firmadoPorRector: boolean;
  firmadoPorCoordinador: boolean;
  estado: 'RADICADA' | 'EN_PROCESO' | 'CUMPLIDA' | 'SUPERADO';
}

export interface BoletinEstudiante {
  codigoEstudiantil: string;
  estudianteNombre: string;
  grado: string;
  periodo: number;
  añoLectivo: string;
  puestoSalon: number;
  totalEstudiantesSalon: number;
  promedioGeneral: number;
  materias: {
    nombre: string;
    docente: string;
    notaCognitiva: number;
    notaProcedimental: number;
    notaActitudinal: number;
    definitiva: number;
    desempeno: string;
    fallas: number;
    juicioValorativo: string;
  }[];
  observacionesDirector: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  salonAula?: string;
  salon?: string;
  jornada?: string;
  cupoMaximo?: number;
  grado?: string | any;
  año_lectivo?: string;
  director_grupo?: string;
  directorDocenteNombre?: string;
  directorDocenteId?: number;
  totalEstudiantes?: number;
}

export interface Calificacion {
  id: number;
  matriculaId?: number;
  estudiante_id?: number;
  materia_id?: number;
  materiaNombre: string;
  docenteNombre?: string;
  nota1?: number;
  nota2?: number;
  nota3?: number;
  nota_final?: number;
  notaCognitiva?: number;
  notaProcedimental?: number;
  notaActitudinal?: number;
  notaDefinitivaPeriodo: number;
  desempeno: 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO';
  observaciones?: string;
}

export interface DashboardStats {
  totalEstudiantes: number;
  totalDocentes: number;
  totalTutores: number;
  totalMaterias: number;
  totalGrupos: number;
  totalMatriculasActivas: number;
}

// Entidades para Rector
export interface ResolucionRectoral {
  id: number;
  numeroResolucion: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  estado: 'VIGENTE' | 'EN_REVISION' | 'HISTORICA';
  categoria: 'ACADEMICA' | 'ADMINISTRATIVA' | 'DISCIPLINARIA' | 'CONTRATACION';
  archivoUrl?: string;
}

// Entidades para Coordinador
export interface CasoConvivencia {
  id: number;
  estudianteNombre: string;
  grupoNombre: string;
  fecha: string;
  tipoFalta: 'TIPO_I' | 'TIPO_II' | 'TIPO_III';
  descripcion: string;
  docenteReporta: string;
  estado: 'ABIERTO' | 'EN_CONCILIACION' | 'CERRADO_CON_COMPROMISO';
  citacionPadres: boolean;
}

export interface CitacionPadres {
  id: number;
  estudianteNombre: string;
  tutorNombre: string;
  telefonoTutor: string;
  fechaHora: string;
  motivo: string;
  asistio: boolean;
  docenteSolicita: string;
}

// Entidades para Director de Grupo
export interface AlumnoGrupoDetalle {
  id: number;
  codigo: string;
  nombreCompleto: string;
  acudientePrincipal: string;
  parentesco: string;
  telefonoEmergencia: string;
  tipoSangreRh: string;
  eps: string;
  alergias: string;
  promedioAcumulado: number;
  asistenciaPorcentaje: number;
  observacionesConvivencia: number;
  autorizadoRetiro: boolean;
}

// Horarios Escolares Institucionales
export interface HorarioClase {
  id: number;
  diaSemana: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
  horaInicio: string;
  horaFin: string;
  grupoNombre: string;
  materiaNombre: string;
  docenteNombre: string;
  aula: string;
  color?: string;
}

// Estudiantes Completo para Administrador (CRUD)
export interface EstudianteCompleto {
  id: number;
  codigoEstudiantil: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  tipoSangreRh: string;
  epsSeguroMedico: string;
  alergiasCondicionesMedicas: string;
  direccionResidencia: string;
  grupoNombre: string;
  tutorNombre: string;
  tutorTelefono: string;
  tutorParentesco: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
}

// Hijo / Menor para Dashboard del Tutor
export interface HijoTutor {
  id: number;
  codigo: string;
  nombreCompleto: string;
  grado: string;
  directorGrupo: string;
  tipoSangreRh: string;
  eps: string;
  alergias: string;
  asistenciaPorcentaje: number;
  promedioGeneral: number;
  puestoEnCurso: number;
  autorizadoRetiro: string;
  calificaciones: {
    materia: string;
    docente: string;
    cognitivo: number;
    procedimental: number;
    actitudinal: number;
    definitiva: number;
    desempeno: 'SUPERIOR' | 'ALTO' | 'BASICO' | 'BAJO';
  }[];
  observaciones: {
    fecha: string;
    docente: string;
    tipo: 'FORMATIVA' | 'FELICITACION' | 'FALTA_LEVE' | 'FALTA_GRAVE';
    descripcion: string;
    compromiso: string;
  }[];
  citaciones: {
    id: number;
    fechaHora: string;
    motivo: string;
    docente: string;
    estado: 'PENDIENTE' | 'CONFIRMADA' | 'REALIZADA';
  }[];
}

// ==============================================================================
// TIPOS PARA AGENTE MIPA Y AUDITORÍA DE TELEMETRÍA (INGRESOS WEB / APP)
// ==============================================================================

export interface TelemetriaResumen {
  total_ingresos: number;
  ingresos_web: number;
  ingresos_app: number;
  ingresos_hoy: number;
  ingresos_por_rol: Record<string, number>;
  ultimos_ingresos: {
    timestamp: string;
    plataforma: string;
    rol: string;
    email?: string;
    nombre?: string;
  }[];
  total_analisis_mipa: number;
  alertas_criticas_generadas: number;
  servidor_estado: string;
  timestamp: string;
}

export interface MateriaAlertaMipa {
  materia: string;
  motivo: string;
}

export interface AnalisisMipaEstudiante {
  codigo_estudiante: string;
  nombre_estudiante?: string;
  grado: string;
  promedio: number;
  cumplimiento_porcentaje: number;
  dias_inactivo: number;
  ira_score: number;
  nivel_prioridad: 'CRITICA' | 'ALTA' | 'MODERADA' | 'PREVENTIVA';
  clasificacion_riesgo: 'CONCEPTUAL' | 'GESTION_TIEMPO' | 'ASISTENCIA_CONECTIVIDAD' | 'MULTIFACTORIAL';
  diagnostico_tecnico: string;
  materias_en_alerta: MateriaAlertaMipa[];
  plan_intervencion: {
    accion_inmediata: string;
    ruta_apoyo: string;
    condiciones_seguimiento: string;
  };
  notificacion_estudiante: {
    asunto: string;
    mensaje: string;
  };
  notificacion_acudiente: {
    asunto: string;
    mensaje: string;
  };
  origen_analisis: string;
  tokens_usados: number;
  timestamp: string;
}

