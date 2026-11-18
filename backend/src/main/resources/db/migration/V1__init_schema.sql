-- =================================================================================
-- MIGRACIÓN FLYWAY V1: ESQUEMA ESTRUCTURAL EDUCONNECT (SAFE & NON-DESTRUCTIVE)
-- Normalización de identificadores ASCII y preservación de datos existentes
-- =================================================================================

-- Bloque de compatibilidad incremental: si existen tablas/columnas previas con 'ñ', se renombran sin pérdida de datos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'años_lectivos') THEN
        ALTER TABLE "años_lectivos" RENAME TO anios_lectivos;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'anios_lectivos' AND column_name = 'año') THEN
        ALTER TABLE anios_lectivos RENAME COLUMN "año" TO anio;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'periodos_academicos' AND column_name = 'año_lectivo_id') THEN
        ALTER TABLE periodos_academicos RENAME COLUMN "año_lectivo_id" TO anio_lectivo_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'grupos' AND column_name = 'año_lectivo_id') THEN
        ALTER TABLE grupos RENAME COLUMN "año_lectivo_id" TO anio_lectivo_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matriculas' AND column_name = 'año_lectivo_id') THEN
        ALTER TABLE matriculas RENAME COLUMN "año_lectivo_id" TO anio_lectivo_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'horarios_escolares' AND column_name = 'año_lectivo_id') THEN
        ALTER TABLE horarios_escolares RENAME COLUMN "año_lectivo_id" TO anio_lectivo_id;
    END IF;
END $$;

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'CC' CHECK (tipo_documento IN ('CC', 'TI', 'CE', 'RC', 'PEP', 'PASAPORTE')),
    documento VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('ADMIN', 'RECTOR', 'COORDINADOR', 'DIRECTOR_GRUPO', 'DOCENTE', 'ESTUDIANTE', 'TUTOR', 'ADMINISTRATIVO')),
    primer_nombre VARCHAR(60) NOT NULL,
    segundo_nombre VARCHAR(60),
    primer_apellido VARCHAR(60) NOT NULL,
    segundo_apellido VARCHAR(60),
    telefono VARCHAR(25),
    direccion VARCHAR(200),
    foto_perfil_url VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    intentos_fallidos INT NOT NULL DEFAULT 0,
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE DOCENTES
CREATE TABLE IF NOT EXISTS docentes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_empleado VARCHAR(30) UNIQUE NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    titulo_profesional VARCHAR(150) NOT NULL,
    escalafon VARCHAR(30) DEFAULT 'Grado 2A',
    fecha_vinculacion DATE NOT NULL,
    tipo_contrato VARCHAR(40) NOT NULL DEFAULT 'TERMINO_INDEFINIDO',
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. TABLA DE TUTORES / ACUDIENTES
CREATE TABLE IF NOT EXISTS tutores (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ocupacion VARCHAR(100),
    empresa_trabajo VARCHAR(120),
    telefono_emergencia VARCHAR(25) NOT NULL,
    correo_alternativo VARCHAR(120),
    autorizado_recoger BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. TABLA DE ESTUDIANTES
CREATE TABLE IF NOT EXISTS estudiantes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_estudiantil VARCHAR(30) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(15) CHECK (genero IN ('M', 'F', 'OTRO')),
    rh_grupo_sanguineo VARCHAR(5) NOT NULL,
    eps VARCHAR(80) NOT NULL,
    alergias_condiciones TEXT DEFAULT 'Ninguna reportada',
    estrato INT CHECK (estrato BETWEEN 1 AND 6),
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    estado_academico VARCHAR(30) NOT NULL DEFAULT 'ACTIVO' CHECK (estado_academico IN ('ACTIVO', 'RETIRADO', 'GRADUADO', 'SUSPENDIDO', 'DESERTOR'))
);

-- 5. RELACIÓN ESTUDIANTE - TUTOR
CREATE TABLE IF NOT EXISTS estudiante_tutor (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    parentesco VARCHAR(40) NOT NULL CHECK (parentesco IN ('PADRE', 'MADRE', 'ABUELO/A', 'TIO/A', 'HERMANO/A', 'ACUDIENTE_LEGAL')),
    es_acudiente_principal BOOLEAN NOT NULL DEFAULT FALSE,
    vive_con_estudiante BOOLEAN NOT NULL DEFAULT TRUE,
    responsable_economico BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(estudiante_id, tutor_id)
);

-- 6. AÑOS LECTIVOS
CREATE TABLE IF NOT EXISTS anios_lectivos (
    id BIGSERIAL PRIMARY KEY,
    anio INT UNIQUE NOT NULL CHECK (anio >= 2020 AND anio <= 2100),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    resolucion_rectoral VARCHAR(100),
    activo BOOLEAN NOT NULL DEFAULT FALSE
);

-- 7. PERIODOS ACADÉMICOS
CREATE TABLE IF NOT EXISTS periodos_academicos (
    id BIGSERIAL PRIMARY KEY,
    anio_lectivo_id BIGINT NOT NULL REFERENCES anios_lectivos(id) ON DELETE CASCADE,
    numero_periodo INT NOT NULL CHECK (numero_periodo BETWEEN 1 AND 4),
    nombre VARCHAR(50) NOT NULL,
    porcentaje_valor NUMERIC(5,2) NOT NULL DEFAULT 25.00,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_cierre_notas TIMESTAMP NOT NULL,
    cerrado BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(anio_lectivo_id, numero_periodo)
);

-- 8. GRADOS ESCOLARES
CREATE TABLE IF NOT EXISTS grados (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL,
    nivel VARCHAR(30) NOT NULL CHECK (nivel IN ('PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA_VOCACIONAL')),
    numero_orden INT UNIQUE NOT NULL
);

-- 9. MATERIAS / ASIGNATURAS
CREATE TABLE IF NOT EXISTS materias (
    id BIGSERIAL PRIMARY KEY,
    codigo_oficial VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    area_conocimiento VARCHAR(100) NOT NULL,
    horas_semanales INT NOT NULL DEFAULT 4,
    descripcion TEXT,
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- 10. GRUPOS / CURSOS
CREATE TABLE IF NOT EXISTS grupos (
    id BIGSERIAL PRIMARY KEY,
    anio_lectivo_id BIGINT NOT NULL REFERENCES anios_lectivos(id) ON DELETE CASCADE,
    grado_id BIGINT NOT NULL REFERENCES grados(id) ON DELETE RESTRICT,
    codigo_grupo VARCHAR(20) NOT NULL,
    director_grupo_id BIGINT REFERENCES docentes(id) ON DELETE SET NULL,
    salon_aula VARCHAR(40) NOT NULL,
    jornada VARCHAR(20) NOT NULL DEFAULT 'MAÑANA' CHECK (jornada IN ('MAÑANA', 'TARDE', 'UNICA')),
    cupo_maximo INT NOT NULL DEFAULT 35,
    UNIQUE(anio_lectivo_id, codigo_grupo)
);

-- 11. CARGA ACADÉMICA
CREATE TABLE IF NOT EXISTS carga_academica (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    intensidad_horaria INT NOT NULL DEFAULT 4,
    UNIQUE(grupo_id, materia_id)
);

-- 12. MATRÍCULAS ESTUDIANTILES
CREATE TABLE IF NOT EXISTS matriculas (
    id BIGSERIAL PRIMARY KEY,
    folio_matricula VARCHAR(30) UNIQUE NOT NULL,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE RESTRICT,
    anio_lectivo_id BIGINT NOT NULL REFERENCES anios_lectivos(id) ON DELETE RESTRICT,
    fecha_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
    es_repitente BOOLEAN NOT NULL DEFAULT FALSE,
    paz_y_salvo BOOLEAN NOT NULL DEFAULT TRUE,
    estado_matricula VARCHAR(30) NOT NULL DEFAULT 'ACTIVA' CHECK (estado_matricula IN ('ACTIVA', 'CANCELADA', 'TRASLADADA', 'PROMOVIDA', 'REPROBADA')),
    UNIQUE(estudiante_id, anio_lectivo_id)
);

-- 13. CALIFICACIONES (DECRETO 1290: 40% COGNITIVA + 30% PROCEDIMENTAL + 30% ACTITUDINAL)
CREATE TABLE IF NOT EXISTS calificaciones (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    carga_academica_id BIGINT NOT NULL REFERENCES carga_academica(id) ON DELETE RESTRICT,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE RESTRICT,
    nota_cognitiva NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (nota_cognitiva >= 1.0 AND nota_cognitiva <= 5.0),
    nota_procedimental NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (nota_procedimental >= 1.0 AND nota_procedimental <= 5.0),
    nota_actitudinal NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (nota_actitudinal >= 1.0 AND nota_actitudinal <= 5.0),
    nota_definitiva_periodo NUMERIC(3,1) NOT NULL DEFAULT 1.0 CHECK (nota_definitiva_periodo >= 1.0 AND nota_definitiva_periodo <= 5.0),
    escala_desempeno VARCHAR(20) NOT NULL DEFAULT 'BAJO' CHECK (escala_desempeno IN ('SUPERIOR', 'ALTO', 'BASICO', 'BAJO')),
    juicio_valorativo TEXT,
    plan_mejoramiento TEXT,
    modificado_por_id BIGINT REFERENCES usuarios(id),
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_modificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(matricula_id, carga_academica_id, periodo_id)
);

-- 14. SOLICITUDES DE MODIFICACIÓN / REAPERTURA DE NOTAS
CREATE TABLE IF NOT EXISTS solicitudes_modificacion_nota (
    id BIGSERIAL PRIMARY KEY,
    calificacion_id BIGINT REFERENCES calificaciones(id) ON DELETE SET NULL,
    docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    estudiante_nombre VARCHAR(150) NOT NULL,
    materia_nombre VARCHAR(100) NOT NULL,
    grupo_codigo VARCHAR(30) NOT NULL,
    periodo_nombre VARCHAR(50) NOT NULL,
    nota_anterior NUMERIC(3,1) NOT NULL,
    nota_nueva_cognitiva NUMERIC(3,1) NOT NULL,
    nota_nueva_procedimental NUMERIC(3,1) NOT NULL,
    nota_nueva_actitudinal NUMERIC(3,1) NOT NULL,
    nota_nueva_definitiva NUMERIC(3,1) NOT NULL,
    motivo TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
    comentario_resolucion TEXT,
    aprobado_por_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP
);

-- 15. ASISTENCIAS DIARIAS
CREATE TABLE IF NOT EXISTS asistencias (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    carga_academica_id BIGINT NOT NULL REFERENCES carga_academica(id) ON DELETE CASCADE,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE RESTRICT,
    fecha_clase DATE NOT NULL DEFAULT CURRENT_DATE,
    estado_asistencia VARCHAR(20) NOT NULL CHECK (estado_asistencia IN ('PRESENTE', 'AUSENTE', 'TARDE', 'EXCUSA_MEDICA', 'PERMISO_INSTITUCIONAL')),
    minutos_retraso INT DEFAULT 0,
    observacion VARCHAR(255),
    justificada BOOLEAN NOT NULL DEFAULT FALSE,
    soporte_excusa_url VARCHAR(255),
    UNIQUE(matricula_id, carga_academica_id, fecha_clase)
);

-- 16. OBSERVADOR DEL ESTUDIANTE
CREATE TABLE IF NOT EXISTS observador_estudiante (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    autor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE RESTRICT,
    fecha_suceso DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_anotacion VARCHAR(30) NOT NULL CHECK (tipo_anotacion IN ('FELICITACION', 'LLAMADO_ATENCION', 'COMPROMISO_ACADEMICO', 'FALTA_CONVIVENCIA', 'SEGUIMIENTO_ORIENTACION')),
    categoria_falta VARCHAR(20) DEFAULT 'NO_APLICA' CHECK (categoria_falta IN ('NO_APLICA', 'TIPO_I', 'TIPO_II', 'TIPO_III')),
    descripcion_hechos TEXT NOT NULL,
    descargos_estudiante TEXT,
    compromisos_acordados TEXT NOT NULL,
    firmado_estudiante BOOLEAN NOT NULL DEFAULT FALSE,
    firmado_acudiente BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. COMUNICADOS Y CIRCULARES
CREATE TABLE IF NOT EXISTS comunicados (
    id BIGSERIAL PRIMARY KEY,
    autor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    titulo VARCHAR(180) NOT NULL,
    contenido TEXT NOT NULL,
    destinatario_rol VARCHAR(30) NOT NULL DEFAULT 'TODOS' CHECK (destinatario_rol IN ('TODOS', 'DOCENTES', 'ESTUDIANTES', 'TUTORES', 'DIRECTIVOS')),
    grupo_especifico_id BIGINT REFERENCES grupos(id) ON DELETE CASCADE,
    importancia VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (importancia IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    archivo_adjunto_url VARCHAR(255),
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 18. RESOLUCIONES RECTORALES
CREATE TABLE IF NOT EXISTS resoluciones_rectorales (
    id BIGSERIAL PRIMARY KEY,
    numero_resolucion VARCHAR(40) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    considerando TEXT NOT NULL,
    resuelve TEXT NOT NULL,
    emitido_por_id BIGINT NOT NULL REFERENCES usuarios(id),
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    vigente BOOLEAN NOT NULL DEFAULT TRUE
);

-- 19. CASOS DE CONVIVENCIA ESCOLAR (LEY 1620)
CREATE TABLE IF NOT EXISTS casos_convivencia (
    id BIGSERIAL PRIMARY KEY,
    radicado VARCHAR(30) UNIQUE NOT NULL,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    reportado_por_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_situacion VARCHAR(20) NOT NULL CHECK (tipo_situacion IN ('TIPO_I', 'TIPO_II', 'TIPO_III')),
    severidad VARCHAR(20) NOT NULL CHECK (severidad IN ('LEVE', 'GRAVE', 'GRAVISIMA')),
    descripcion_suceso TEXT NOT NULL,
    involucrados TEXT,
    medida_pedagogica TEXT,
    remitido_comite BOOLEAN NOT NULL DEFAULT FALSE,
    estado_caso VARCHAR(30) NOT NULL DEFAULT 'ABIERTO' CHECK (estado_caso IN ('ABIERTO', 'EN_SEGUIMIENTO', 'COMITE_CONVIVENCIA', 'CERRADO')),
    acta_cierre TEXT,
    fecha_cierre TIMESTAMP
);

-- 20. CITACIONES A PADRES Y ACUDIENTES
CREATE TABLE IF NOT EXISTS citaciones_padres (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    convocado_por_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_hora_cita TIMESTAMP NOT NULL,
    lugar_o_enlace VARCHAR(180) NOT NULL DEFAULT 'Sala de Coordinación - Sede Principal',
    motivo_citacion TEXT NOT NULL,
    modalidad VARCHAR(20) NOT NULL DEFAULT 'PRESENCIAL' CHECK (modalidad IN ('PRESENCIAL', 'VIRTUAL', 'TELEFONICA')),
    estado_cita VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_cita IN ('PENDIENTE', 'CONFIRMADA_ACUDIENTE', 'REALIZADA', 'INASISTENCIA_PADRE', 'REPROGRAMADA')),
    compromisos_acta TEXT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. HORARIOS ESCOLARES SEMANALES
CREATE TABLE IF NOT EXISTS horarios_escolares (
    id BIGSERIAL PRIMARY KEY,
    anio_lectivo_id BIGINT NOT NULL REFERENCES anios_lectivos(id) ON DELETE CASCADE,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
    dia_semana VARCHAR(15) NOT NULL CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES')),
    bloque_orden INT NOT NULL CHECK (bloque_orden BETWEEN 1 AND 8),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(50) NOT NULL,
    UNIQUE(anio_lectivo_id, grupo_id, dia_semana, bloque_orden),
    UNIQUE(anio_lectivo_id, docente_id, dia_semana, bloque_orden)
);

-- 22. JUSTIFICACIONES DE INASISTENCIA
CREATE TABLE IF NOT EXISTS justificaciones_inasistencia (
    id BIGSERIAL PRIMARY KEY,
    asistencia_id BIGINT UNIQUE NOT NULL REFERENCES asistencias(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    motivo_excusa TEXT NOT NULL,
    tipo_excusa VARCHAR(30) NOT NULL DEFAULT 'MEDICA' CHECK (tipo_excusa IN ('MEDICA', 'CALAMIDAD_DOMESTICA', 'FUERZA_MAYOR', 'REPRESENTACION_DEPORTIVA')),
    soporte_url VARCHAR(255),
    estado_revision VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE_REVISION' CHECK (estado_revision IN ('PENDIENTE_REVISION', 'APROBADA_COORDINACION', 'RECHAZADA')),
    revisado_por_id BIGINT REFERENCES usuarios(id),
    observacion_coordinacion TEXT,
    fecha_radicacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 23. CÓDIGOS DE RECUPERACIÓN DE CONTRASEÑA (HASHED OTP)
CREATE TABLE IF NOT EXISTS codigos_recuperacion (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    codigo VARCHAR(120) NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    expira_en TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 24. TELEMETRÍA INSTITUCIONAL DE INGRESOS
CREATE TABLE IF NOT EXISTS telemetria_ingresos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    rol_acceso VARCHAR(30) NOT NULL,
    modulo_visitado VARCHAR(60) NOT NULL,
    direccion_ip VARCHAR(45) DEFAULT '127.0.0.1',
    dispositivo VARCHAR(120) DEFAULT 'Web Browser',
    fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 25. BITÁCORA MIPA (MOTOR INTELIGENTE DE PREVENCIÓN DE ABANDONO)
CREATE TABLE IF NOT EXISTS bitacora_mipa (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    indice_riesgo NUMERIC(5,2) NOT NULL CHECK (indice_riesgo BETWEEN 0 AND 100),
    nivel_alerta VARCHAR(20) NOT NULL CHECK (nivel_alerta IN ('BAJO', 'MODERADO', 'ALTO', 'CRITICO')),
    factores_detectados TEXT NOT NULL,
    intervencion_sugerida TEXT NOT NULL,
    atendido_orientacion BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_calculo TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_documento ON usuarios(documento);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_grupo ON matriculas(grupo_id);
CREATE INDEX IF NOT EXISTS idx_calif_matricula ON calificaciones(matricula_id);
CREATE INDEX IF NOT EXISTS idx_calif_carga_periodo ON calificaciones(carga_academica_id, periodo_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha_clase);
CREATE INDEX IF NOT EXISTS idx_codigos_email ON codigos_recuperacion(email);

-- TRIGGER AUTOMÁTICO DECRETO 1290
CREATE OR REPLACE FUNCTION fn_calcular_definitiva_decreto1290()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nota_definitiva_periodo := ROUND((NEW.nota_cognitiva * 0.40) + (NEW.nota_procedimental * 0.30) + (NEW.nota_actitudinal * 0.30), 1);

    IF NEW.nota_definitiva_periodo >= 4.6 THEN
        NEW.escala_desempeno := 'SUPERIOR';
    ELSIF NEW.nota_definitiva_periodo >= 4.0 THEN
        NEW.escala_desempeno := 'ALTO';
    ELSIF NEW.nota_definitiva_periodo >= 3.0 THEN
        NEW.escala_desempeno := 'BASICO';
    ELSE
        NEW.escala_desempeno := 'BAJO';
    END IF;

    NEW.fecha_ultima_modificacion := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_definitiva ON calificaciones;
CREATE TRIGGER trg_calcular_definitiva
BEFORE INSERT OR UPDATE ON calificaciones
FOR EACH ROW
EXECUTE FUNCTION fn_calcular_definitiva_decreto1290();

-- VISTAS ANALÍTICAS
CREATE OR REPLACE VIEW vista_sabana_notas AS
SELECT
    m.folio_matricula,
    u_est.documento AS documento_estudiante,
    CONCAT(u_est.primer_apellido, ' ', COALESCE(u_est.segundo_apellido, ''), ' ', u_est.primer_nombre) AS estudiante,
    g.codigo_grupo AS curso,
    mat.area_conocimiento,
    mat.nombre AS asignatura,
    CONCAT(u_doc.primer_nombre, ' ', u_doc.primer_apellido) AS docente,
    p.numero_periodo AS periodo,
    c.nota_cognitiva AS saber_40,
    c.nota_procedimental AS hacer_30,
    c.nota_actitudinal AS ser_30,
    c.nota_definitiva_periodo AS definitiva,
    c.escala_desempeno AS desempeno,
    c.juicio_valorativo
FROM calificaciones c
JOIN matriculas m ON c.matricula_id = m.id
JOIN estudiantes e ON m.estudiante_id = e.id
JOIN usuarios u_est ON e.usuario_id = u_est.id
JOIN grupos g ON m.grupo_id = g.id
JOIN carga_academica ca ON c.carga_academica_id = ca.id
JOIN materias mat ON ca.materia_id = mat.id
JOIN docentes d ON ca.docente_id = d.id
JOIN usuarios u_doc ON d.usuario_id = u_doc.id
JOIN periodos_academicos p ON c.periodo_id = p.id;

CREATE OR REPLACE VIEW vista_resumen_asistencia AS
SELECT
    m.folio_matricula,
    CONCAT(u_est.primer_nombre, ' ', u_est.primer_apellido) AS estudiante,
    g.codigo_grupo AS curso,
    COUNT(*) FILTER (WHERE a.estado_asistencia = 'PRESENTE') AS total_presente,
    COUNT(*) FILTER (WHERE a.estado_asistencia = 'AUSENTE' AND a.justificada = FALSE) AS fallas_injustificadas,
    COUNT(*) FILTER (WHERE a.estado_asistencia = 'EXCUSA_MEDICA' OR a.justificada = TRUE) AS fallas_justificadas,
    COUNT(*) FILTER (WHERE a.estado_asistencia = 'TARDE') AS llegadas_tarde
FROM matriculas m
JOIN estudiantes e ON m.estudiante_id = e.id
JOIN usuarios u_est ON e.usuario_id = u_est.id
JOIN grupos g ON m.grupo_id = g.id
LEFT JOIN asistencias a ON a.matricula_id = m.id
GROUP BY m.folio_matricula, u_est.primer_nombre, u_est.primer_apellido, g.codigo_grupo;
