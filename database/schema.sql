-- ==============================================================================
-- SISTEMA DE GESTIÓN EDUCATIVA INSTITUCIONAL: EduConnect
-- MOTOR: PostgreSQL 14+ / Supabase
-- VERSIÓN: 2.0 (Diseño Normalizado para Colegios / Escuelas)
-- ==============================================================================

-- 1. LIMPIEZA PREVIA (EN CASO DE REGENERACIÓN)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Extensiones útiles para UUIDs y funciones criptográficas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA PRINCIPAL DE USUARIOS Y AUTENTICACIÓN
-- Compatible con Spring Security (BCrypt) y JWT
-- ==============================================================================
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Hasheado con BCrypt desde Spring Boot
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('ADMIN', 'RECTOR', 'COORDINADOR', 'DIRECTOR_GRUPO', 'DOCENTE', 'ESTUDIANTE', 'TUTOR', 'ADMINISTRATIVO')),
    primer_nombre VARCHAR(100) NOT NULL,
    segundo_nombre VARCHAR(100),
    primer_apellido VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ==============================================================================
-- 3. PERFIL DE TUTORES / PADRES / ACUDIENTES
-- Crucial para instituciones con niños y menores de edad
-- ==============================================================================
CREATE TABLE tutores (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL, -- Opcional: si el acudiente tiene acceso al portal
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'PASAPORTE', 'PEP')),
    numero_documento VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    telefono_principal VARCHAR(30) NOT NULL,
    telefono_secundario VARCHAR(30),
    correo VARCHAR(150),
    direccion_residencia TEXT NOT NULL,
    barrio_municipio VARCHAR(100),
    ocupacion VARCHAR(120),
    lugar_trabajo VARCHAR(150),
    telefono_trabajo VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_tutores_documento ON tutores(numero_documento);

-- ==============================================================================
-- 4. PERFIL DE ESTUDIANTES
-- Datos académicos, médicos y de emergencia indispensables para colegios
-- ==============================================================================
CREATE TABLE estudiantes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL, -- Opcional: acceso personal a la plataforma
    codigo_estudiantil VARCHAR(30) NOT NULL UNIQUE, -- Ej: EST-2026-001
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('RC', 'TI', 'CC', 'CE', 'PASAPORTE')),
    numero_documento VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(15) NOT NULL CHECK (genero IN ('MASCULINO', 'FEMENINO', 'OTRO')),
    -- INFORMACIÓN MÉDICA VITAL (Institucional para menores)
    tipo_sangre_rh VARCHAR(5) NOT NULL, -- Ej: O+, A+, AB-, etc.
    eps_seguro_medico VARCHAR(100) NOT NULL,
    alergias_condiciones_medicas TEXT, -- Ej: Asma, Alergia al maní, etc.
    medicamentos_permanentes TEXT,
    direccion_residencia TEXT NOT NULL,
    estrato_socioeconomico INT CHECK (estrato_socioeconomico BETWEEN 1 AND 6),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'GRADUADO', 'RETIRADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo_estudiantil);
CREATE INDEX idx_estudiantes_documento ON estudiantes(numero_documento);

-- ==============================================================================
-- 5. RELACIÓN ESTUDIANTE - TUTOR (Muchos a Muchos)
-- Permite que un alumno tenga múltiples acudientes (Papá, Mamá, Tutor Legal)
-- y que un tutor tenga varios hijos inscritos en el colegio.
-- ==============================================================================
CREATE TABLE estudiantes_tutores (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    parentesco VARCHAR(30) NOT NULL CHECK (parentesco IN ('MADRE', 'PADRE', 'ABUELO_A', 'TIO_A', 'HERMANO_A', 'TUTOR_LEGAL', 'OTRO')),
    es_acudiente_principal BOOLEAN DEFAULT FALSE NOT NULL,
    vive_con_estudiante BOOLEAN DEFAULT TRUE NOT NULL,
    autorizado_recoger_estudiante BOOLEAN DEFAULT TRUE NOT NULL, -- Filtro de seguridad a la salida del colegio
    contacto_emergencia BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_estudiante_tutor UNIQUE (estudiante_id, tutor_id)
);

CREATE INDEX idx_est_tut_estudiante ON estudiantes_tutores(estudiante_id);
CREATE INDEX idx_est_tut_tutor ON estudiantes_tutores(tutor_id);

-- ==============================================================================
-- 6. PERFIL DE DOCENTES
-- ==============================================================================
CREATE TABLE docentes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_documento VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'PASAPORTE')),
    numero_documento VARCHAR(50) NOT NULL UNIQUE,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    titulo_academico VARCHAR(150) NOT NULL,
    especialidad VARCHAR(150),
    escalafon_categoria VARCHAR(50),
    fecha_contratacion DATE DEFAULT CURRENT_DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'LICENCIA', 'INACTIVO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_docentes_documento ON docentes(numero_documento);

-- ==============================================================================
-- 7. ESTRUCTURA ACADÉMICA (Años Lectivos, Periodos, Grados, Materias, Grupos)
-- ==============================================================================
CREATE TABLE "años_lectivos" (
    id BIGSERIAL PRIMARY KEY,
    "año" INT NOT NULL UNIQUE, -- Ej: 2026
    nombre VARCHAR(100) NOT NULL, -- Ej: "Año Escolar 2026"
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    es_actual BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE periodos_academicos (
    id BIGSERIAL PRIMARY KEY,
    "año_lectivo_id" BIGINT NOT NULL REFERENCES "años_lectivos"(id) ON DELETE CASCADE,
    nombre VARCHAR(60) NOT NULL, -- Ej: "Primer Periodo", "Segundo Periodo"
    numero_periodo INT NOT NULL CHECK (numero_periodo BETWEEN 1 AND 6),
    porcentaje_peso DECIMAL(5, 2) DEFAULT 25.00 NOT NULL, -- Ponderación (ej: 25%)
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    cerrado BOOLEAN DEFAULT FALSE NOT NULL, -- Si está cerrado, los docentes ya no editan notas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_año_numero_periodo UNIQUE ("año_lectivo_id", numero_periodo)
);

CREATE TABLE grados (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE, -- Ej: "PRE-TRANS", "PRIM-01", "BACH-11"
    nombre VARCHAR(80) NOT NULL UNIQUE, -- Ej: "Transición", "Primero", "Segundo", etc.
    nivel VARCHAR(30) NOT NULL CHECK (nivel IN ('PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA')),
    orden_jerarquico INT NOT NULL UNIQUE -- 0=Preescolar, 1=Primero, ..., 11=Once
);

CREATE TABLE materias (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE, -- Ej: "MAT-PRIM-01"
    nombre VARCHAR(120) NOT NULL, -- Ej: "Matemáticas Básica", "Lengua Castellana"
    descripcion TEXT,
    area_conocimiento VARCHAR(100) NOT NULL, -- Ej: "Ciencias Exactas", "Humanidades"
    horas_semanales INT DEFAULT 4 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE grupos (
    id BIGSERIAL PRIMARY KEY,
    "año_lectivo_id" BIGINT NOT NULL REFERENCES "años_lectivos"(id) ON DELETE CASCADE,
    grado_id BIGINT NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL, -- Ej: "1°A", "Transición Mañana", "11°02"
    director_grupo_docente_id BIGINT REFERENCES docentes(id) ON DELETE SET NULL,
    salon_aula VARCHAR(60), -- Ej: "Aula 201 - Bloque B"
    jornada VARCHAR(20) DEFAULT 'MANANA' CHECK (jornada IN ('MANANA', 'TARDE', 'UNICA')),
    cupo_maximo INT DEFAULT 35 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_grupo_año_grado_nombre UNIQUE ("año_lectivo_id", grado_id, nombre)
);

-- ==============================================================================
-- 8. MATRÍCULAS Y ASIGNACIÓN ACADÉMICA
-- ==============================================================================
CREATE TABLE matriculas (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    "año_lectivo_id" BIGINT NOT NULL REFERENCES "años_lectivos"(id) ON DELETE CASCADE,
    numero_folio VARCHAR(60) NOT NULL UNIQUE, -- Número único de acta de matrícula
    fecha_matricula DATE DEFAULT CURRENT_DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'RETIRADO', 'SUSPENDIDO', 'GRADUADO', 'TRASLADADO')),
    observaciones TEXT,
    promedio_general DECIMAL(4, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_estudiante_año_matricula UNIQUE (estudiante_id, "año_lectivo_id")
);

CREATE INDEX idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX idx_matriculas_grupo ON matriculas(grupo_id);

-- Qué profesor da qué materia a qué grupo:
CREATE TABLE cargas_academicas (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    horario_descripcion TEXT, -- Ej: "Lunes 07:00-09:00, Jueves 09:30-11:30"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_carga_grupo_materia UNIQUE (grupo_id, materia_id)
);

CREATE INDEX idx_cargas_docente ON cargas_academicas(docente_id);
CREATE INDEX idx_cargas_grupo ON cargas_academicas(grupo_id);

-- ==============================================================================
-- 9. CALIFICACIONES NORMALIZADAS
-- Notas por matrícula, carga académica y periodo
-- ==============================================================================
CREATE TABLE calificaciones (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    carga_academica_id BIGINT NOT NULL REFERENCES cargas_academicas(id) ON DELETE CASCADE,
    periodo_id BIGINT NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
    nota_cognitiva DECIMAL(4, 2) CHECK (nota_cognitiva BETWEEN 0.00 AND 5.00), -- 40% (Exámenes)
    nota_procedimental DECIMAL(4, 2) CHECK (nota_procedimental BETWEEN 0.00 AND 5.00), -- 40% (Talleres, Proyectos)
    nota_actitudinal DECIMAL(4, 2) CHECK (nota_actitudinal BETWEEN 0.00 AND 5.00), -- 20% (Convivencia, Participación)
    nota_definitiva_periodo DECIMAL(4, 2) CHECK (nota_definitiva_periodo BETWEEN 0.00 AND 5.00),
    desempeno VARCHAR(20) CHECK (desempeno IN ('SUPERIOR', 'ALTO', 'BASICO', 'BAJO')),
    observaciones TEXT,
    fecha_calificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_por_docente_id BIGINT REFERENCES docentes(id),
    CONSTRAINT uq_calificacion_periodo UNIQUE (matricula_id, carga_academica_id, periodo_id)
);

CREATE INDEX idx_calif_matricula ON calificaciones(matricula_id);
CREATE INDEX idx_calif_carga ON calificaciones(carga_academica_id);

-- ==============================================================================
-- 10. ASISTENCIAS (Control Diario de Menores y Reporte a Tutores)
-- ==============================================================================
CREATE TABLE asistencias (
    id BIGSERIAL PRIMARY KEY,
    matricula_id BIGINT NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
    carga_academica_id BIGINT NOT NULL REFERENCES cargas_academicas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    estado VARCHAR(25) NOT NULL CHECK (estado IN ('PRESENTE', 'AUSENTE_JUSTIFICADO', 'AUSENTE_INJUSTIFICADO', 'TARDE')),
    motivo_justificacion TEXT,
    notificado_a_tutor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_asistencia_estudiante_fecha_clase UNIQUE (matricula_id, carga_academica_id, fecha)
);

CREATE INDEX idx_asistencia_fecha ON asistencias(fecha);

-- ==============================================================================
-- 11. OBSERVADOR DEL ESTUDIANTE (Seguimiento Convivencial y Disciplinario)
-- ==============================================================================
CREATE TABLE observador_estudiante (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('FELICITACION', 'FALTA_LEVE', 'FALTA_GRAVE', 'CITACION_ACUDIENTE', 'SEGUIMIENTO_PSICOPEDAGOGICO')),
    descripcion TEXT NOT NULL,
    compromisos_acordados TEXT,
    firmado_por_estudiante BOOLEAN DEFAULT FALSE,
    firmado_por_tutor BOOLEAN DEFAULT FALSE,
    requiere_presencia_padres BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_observador_estudiante ON observador_estudiante(estudiante_id);

-- ==============================================================================
-- 12. CIRCULARES, COMUNICADOS Y NOTIFICACIONES INSTITUCIONALES
-- ==============================================================================
CREATE TABLE comunicados (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    remitente_id BIGINT NOT NULL REFERENCES usuarios(id),
    dirigido_a VARCHAR(30) NOT NULL CHECK (dirigido_a IN ('TODOS', 'TUTORES', 'ESTUDIANTES', 'DOCENTES')),
    grado_id BIGINT REFERENCES grados(id) ON DELETE SET NULL, -- Opcional: dirigido solo a un grado
    es_urgente BOOLEAN DEFAULT FALSE,
    adjunto_url TEXT,
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- 13. RESOLUCIONES RECTORALES Y ACTOS DE GOBIERNO INSTITUCIONAL
-- ==============================================================================
CREATE TABLE resoluciones_rectorales (
    id BIGSERIAL PRIMARY KEY,
    numero_resolucion VARCHAR(50) NOT NULL UNIQUE, -- Ej: "RES-001-2026"
    fecha DATE NOT NULL,
    titulo VARCHAR(250) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(40) NOT NULL CHECK (categoria IN ('ACADEMICA', 'ADMINISTRATIVA', 'DISCIPLINARIA', 'CONTRATACION')),
    estado VARCHAR(20) DEFAULT 'VIGENTE' CHECK (estado IN ('VIGENTE', 'EN_REVISION', 'HISTORICA')),
    firmado_por_rector_id BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- 14. CASOS DE CONVIVENCIA ESCOLAR (LEY 1620 DE 2013)
-- ==============================================================================
CREATE TABLE casos_convivencia (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    tipo_falta VARCHAR(20) NOT NULL CHECK (tipo_falta IN ('TIPO_I', 'TIPO_II', 'TIPO_III')),
    descripcion TEXT NOT NULL,
    docente_reporta_id BIGINT NOT NULL REFERENCES usuarios(id),
    estado VARCHAR(30) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'EN_CONCILIACION', 'CERRADO_CON_COMPROMISO')),
    citacion_padres BOOLEAN DEFAULT FALSE,
    acuerdos_pedagogicos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- 15. CITACIONES A PADRES Y ACUDIENTES
-- ==============================================================================
CREATE TABLE citaciones_padres (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    motivo TEXT NOT NULL,
    asistio BOOLEAN DEFAULT FALSE,
    docente_coordinador_id BIGINT NOT NULL REFERENCES usuarios(id),
    compromisos_firmados TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- 16. HORARIOS ESCOLARES INSTITUCIONALES (Para Coordinador, Docente, Alumnos y Tutores)
-- ==============================================================================
CREATE TABLE horarios_escolares (
    id BIGSERIAL PRIMARY KEY,
    "año_lectivo_id" BIGINT NOT NULL REFERENCES "años_lectivos"(id) ON DELETE CASCADE,
    grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    materia_id BIGINT NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
    docente_id BIGINT NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    dia_semana VARCHAR(15) NOT NULL CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO')),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula_salon VARCHAR(60) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_horarios_grupo ON horarios_escolares(grupo_id);
CREATE INDEX idx_horarios_docente ON horarios_escolares(docente_id);

-- ==============================================================================
-- 17. RADICACIÓN DE EXCUSAS Y JUSTIFICACIONES DE INASISTENCIA (Tutores y Coordinación)
-- ==============================================================================
CREATE TABLE justificaciones_inasistencia (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tutor_id BIGINT NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    fecha_inasistencia DATE NOT NULL,
    motivo TEXT NOT NULL,
    soporte_documento_url TEXT,
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')),
    respuesta_coordinador TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- 18. DATOS INICIALES (SEMILLA / SEED DATA)
-- Contraseña por defecto para todos los usuarios de prueba: "Admin123*"
-- Hasheada con BCrypt: $2a$10$w3U6sJ9T7FqD8p3rL9k1le2eC8kH6lD/mZ8/V6QYd2qF2y2gW1jfe
-- ==============================================================================

-- 16.1. Usuarios del Sistema (Incluye Rectoría, Coordinación, Dirección y Docencia)
INSERT INTO usuarios (email, password_hash, rol, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, activo)
VALUES 
('admin@educonnect.edu.co', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'ADMIN', 'Carlos', 'Alberto', 'Vargas', 'Rodríguez', true),
('rector@educonnect.edu.co', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'RECTOR', 'Fernando', 'José', 'Restrepo', 'Giraldo', true),
('coordinador@educonnect.edu.co', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'COORDINADOR', 'Claudia', 'Patricia', 'Morales', 'Patiño', true),
('prof.silva@educonnect.edu.co', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'DIRECTOR_GRUPO', 'Roberto', 'Carlos', 'Silva', 'Mendoza', true),
('prof.gomez@educonnect.edu.co', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'DOCENTE', 'Elena', 'Patricia', 'Gómez', 'Ríos', true),
('padre.ramirez@gmail.com', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'TUTOR', 'Juan', 'Fernando', 'Ramírez', 'Castro', true),
('carlosvargas@gmail.com', '$2a$10$eO0gYlZ5aO9R8ZfQp0vK3O7fD1P9M2K0qJ1rX8w7Y9v6Q5k4z2y1a', 'ESTUDIANTE', 'Carlos', 'Alberto', 'Vargas', 'Pérez', true);

-- 16.2. Años Lectivos y Periodos
INSERT INTO "años_lectivos" ("año", nombre, fecha_inicio, fecha_fin, es_actual)
VALUES (2026, 'Año Escolar 2026', '2026-01-20', '2026-11-30', true);

INSERT INTO periodos_academicos ("año_lectivo_id", nombre, numero_periodo, porcentaje_peso, fecha_inicio, fecha_fin, cerrado)
VALUES 
(1, 'Periodo 1', 1, 25.00, '2026-01-20', '2026-04-10', false),
(1, 'Periodo 2', 2, 25.00, '2026-04-13', '2026-06-26', false),
(1, 'Periodo 3', 3, 25.00, '2026-07-13', '2026-09-18', false),
(1, 'Periodo 4', 4, 25.00, '2026-09-21', '2026-11-27', false);

-- 13.3. Grados Académicos
INSERT INTO grados (codigo, nombre, nivel, orden_jerarquico)
VALUES
('TRANS-00', 'Transición (Preescolar)', 'PREESCOLAR', 0),
('PRIM-01', 'Primero de Primaria', 'PRIMARIA', 1),
('PRIM-02', 'Segundo de Primaria', 'PRIMARIA', 2),
('PRIM-03', 'Tercero de Primaria', 'PRIMARIA', 3),
('PRIM-04', 'Cuarto de Primaria', 'PRIMARIA', 4),
('PRIM-05', 'Quinto de Primaria', 'PRIMARIA', 5),
('SEC-06', 'Sexto de Secundaria', 'SECUNDARIA', 6),
('SEC-07', 'Séptimo de Secundaria', 'SECUNDARIA', 7),
('SEC-08', 'Octavo de Secundaria', 'SECUNDARIA', 8),
('SEC-09', 'Noveno de Secundaria', 'SECUNDARIA', 9),
('MED-10', 'Décimo de Bachillerato', 'MEDIA', 10),
('MED-11', 'Once de Bachillerato', 'MEDIA', 11);

-- 13.4. Materias
INSERT INTO materias (codigo, nombre, descripcion, area_conocimiento, horas_semanales)
VALUES
('MAT-01', 'Matemáticas y Geometría', 'Pensamiento numérico, lógico y espacial', 'Ciencias Exactas', 5),
('LEN-01', 'Lengua Castellana y Literatura', 'Comprensión lectora, gramática y redacción', 'Humanidades', 5),
('CIE-01', 'Ciencias Naturales y Educación Ambiental', 'Biología, entorno vivo y conservación', 'Ciencias Naturales', 4),
('SOC-01', 'Ciencias Sociales e Historia', 'Geografía, constitución y convivencia', 'Ciencias Sociales', 3),
('ING-01', 'Inglés Comunicativo', 'Enfoque comunicativo y bilingüismo básico', 'Idiomas', 4),
('EDU-01', 'Educación Física y Deportes', 'Desarrollo motriz, trabajo en equipo y salud', 'Educación Física', 2),
('ART-01', 'Educación Artística y Cultural', 'Expresión plástica, música y creatividad', 'Artes', 2),
('TEC-01', 'Tecnología e Informática', 'Pensamiento computacional y herramientas digitales', 'Tecnología', 2);

-- 13.5. Docentes
INSERT INTO docentes (usuario_id, tipo_documento, numero_documento, nombres, apellidos, telefono, titulo_academico, especialidad)
VALUES
(2, 'CC', '1098765432', 'Roberto Carlos', 'Silva Mendoza', '+57 310 1234567', 'Licenciado en Matemáticas y Física', 'Álgebra y Cálculo'),
(3, 'CC', '1087654321', 'Elena Patricia', 'Gómez Ríos', '+57 312 9876543', 'Licenciada en Humanidades e Idiomas', 'Literatura Infantil');

-- 13.6. Grupos
INSERT INTO grupos ("año_lectivo_id", grado_id, nombre, director_grupo_docente_id, salon_aula, jornada, cupo_maximo)
VALUES
(1, 2, '1°A - Primaria', 1, 'Aula 101 - Bloque A', 'MANANA', 30),
(1, 3, '2°A - Primaria', 2, 'Aula 102 - Bloque A', 'MANANA', 30);

-- 13.7. Tutor (Padre de Familia)
INSERT INTO tutores (usuario_id, tipo_documento, numero_documento, nombres, apellidos, telefono_principal, telefono_secundario, correo, direccion_residencia, barrio_municipio, ocupacion, lugar_trabajo)
VALUES
(4, 'CC', '79888999', 'Juan Fernando', 'Ramírez Castro', '+57 300 5556677', '+57 315 2223344', 'padre.ramirez@gmail.com', 'Calle 45 # 12-34', 'Los Rosales', 'Ingeniero Civil', 'Constructora Bolívar');

-- 18.8. Estudiantes (Menores de edad)
INSERT INTO estudiantes (usuario_id, codigo_estudiantil, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, genero, tipo_sangre_rh, eps_seguro_medico, alergias_condiciones_medicas, direccion_residencia, estrato_socioeconomico)
VALUES
(5, 'EST-2026-001', 'RC', '1192837465', 'Lucas Mateo', 'Ramírez Pérez', '2019-05-14', 'MASCULINO', 'O+', 'Sanitas EPS', 'Alergia al polen y penicilina. Portador de inhalador para asma leve.', 'Calle 45 # 12-34', 3),
(7, 'EST-2026-042', 'TI', '1093847562', 'Sofía Valentina', 'Ramírez Pérez', '2012-11-05', 'FEMENINO', 'O+', 'Sanitas EPS', 'Rinitis alérgica estacional. Sin medicamentos permanentes.', 'Calle 45 # 12-34', 3);

-- 18.9. Vínculo Estudiante - Tutor (El tutor Juan Fernando Ramírez tiene 2 hijos vinculados)
INSERT INTO estudiantes_tutores (estudiante_id, tutor_id, parentesco, es_acudiente_principal, vive_con_estudiante, autorizado_recoger_estudiante, contacto_emergencia)
VALUES
(1, 1, 'PADRE', true, true, true, true),
(2, 1, 'PADRE', true, true, true, true);

-- 18.10. Matrículas de Estudiantes
INSERT INTO matriculas (estudiante_id, grupo_id, "año_lectivo_id", numero_folio, observaciones)
VALUES
(1, 1, 1, 'MAT-2026-PRIM-001', 'Lucas Mateo matriculado en 1°A Primaria. Certificado médico y carnet de vacunas al día.'),
(2, 2, 1, 'MAT-2026-SEC-042', 'Sofía Valentina matriculada en 6°A Secundaria. Paz y salvo institucional anterior.');

-- 18.11. Cargas Académicas (Asignaturas)
INSERT INTO cargas_academicas (grupo_id, materia_id, docente_id, horario_descripcion)
VALUES
(1, 1, 1, 'Lunes 07:00-09:00, Miércoles 07:00-08:30'),
(1, 2, 2, 'Martes 07:00-09:00, Jueves 07:00-09:00'),
(2, 1, 1, 'Lunes 07:00-08:30, Martes 10:30-12:00, Jueves 08:30-10:00'),
(2, 2, 2, 'Lunes 08:30-10:00, Miércoles 07:00-08:30, Viernes 07:00-08:30');

-- 18.12. Calificaciones de Prueba
INSERT INTO calificaciones (matricula_id, carga_academica_id, periodo_id, nota_cognitiva, nota_procedimental, nota_actitudinal, nota_definitiva_periodo, desempeno, observaciones, actualizado_por_docente_id)
VALUES
(1, 1, 1, 4.80, 4.50, 5.00, 4.70, 'SUPERIOR', 'Excelente comprensión de conceptos matemáticos iniciales.', 1),
(2, 3, 1, 4.20, 4.30, 4.80, 4.36, 'ALTO', 'Buen desarrollo en resolución de ecuaciones algebraicas.', 1);

-- 18.13. Registro de Asistencias
INSERT INTO asistencias (matricula_id, carga_academica_id, fecha, estado, notificado_a_tutor)
VALUES
(1, 1, '2026-02-02', 'PRESENTE', false),
(1, 1, '2026-02-04', 'PRESENTE', false),
(2, 3, '2026-02-02', 'PRESENTE', false);

-- 18.14. Horarios Escolares Institucionales
INSERT INTO horarios_escolares ("año_lectivo_id", grupo_id, materia_id, docente_id, dia_semana, hora_inicio, hora_fin, aula_salon)
VALUES
(1, 2, 1, 1, 'LUNES', '07:00:00', '08:30:00', 'Aula 201 - Bloque A'),
(1, 2, 2, 2, 'LUNES', '08:30:00', '10:00:00', 'Aula 201 - Bloque A'),
(1, 2, 1, 1, 'MARTES', '10:30:00', '12:00:00', 'Aula 201 - Bloque A'),
(1, 2, 2, 2, 'MIERCOLES', '07:00:00', '08:30:00', 'Aula 201 - Bloque A'),
(1, 2, 1, 1, 'JUEVES', '08:30:00', '10:00:00', 'Aula 201 - Bloque A'),
(1, 2, 2, 2, 'VIERNES', '07:00:00', '08:30:00', 'Aula 201 - Bloque A'),
(1, 1, 1, 1, 'LUNES', '07:00:00', '09:00:00', 'Aula 101 - Bloque A'),
(1, 1, 2, 2, 'MARTES', '07:00:00', '09:00:00', 'Aula 101 - Bloque A');

-- 18.15. Observador del Estudiante
INSERT INTO observador_estudiante (estudiante_id, docente_id, tipo, descripcion, compromisos_acordados, firmado_por_tutor)
VALUES
(1, 1, 'FELICITACION', 'Lucas mostró gran liderazgo y colaboración ayudando a sus compañeros en la actividad de lógica matemática.', 'Continuar fomentando su espíritu solidario en casa.', true),
(2, 2, 'FELICITACION', 'Sofía presentó un ensayo sobresaliente sobre literatura latinoamericana contemporánea.', 'Participar en el concurso intercolegial de oratoria.', true);

-- 18.16. Citaciones a Padres de Familia
INSERT INTO citaciones_padres (estudiante_id, tutor_id, fecha_hora, motivo, asistio, docente_coordinador_id, compromisos_firmados)
VALUES
(1, 1, '2026-03-12 08:00:00', 'Entrega de informes del Primer Periodo y conformación del comité de padres.', false, 2, 'Pendiente de realización.');

-- 18.17. Justificaciones de Inasistencia
INSERT INTO justificaciones_inasistencia (estudiante_id, tutor_id, fecha_inasistencia, motivo, soporte_documento_url, estado, respuesta_coordinador)
VALUES
(1, 1, '2026-02-16', 'Cita médica odontológica programada en Sanitas EPS.', 'https://soporte.eps.co/radicado-09218', 'APROBADA', 'Justificación aceptada. Docentes notificados para reprogramar talleres.');

-- 18.18. Comunicado Institucional Inicial
INSERT INTO comunicados (titulo, contenido, remitente_id, dirigido_a, es_urgente)
VALUES
('Bienvenida al Año Escolar 2026', 'Estimados padres de familia, docentes y estudiantes: les damos la más cordial bienvenida al nuevo ciclo académico en EduConnect. Recordamos que el ingreso es a las 06:45 AM con uniforme de diario.', 1, 'TODOS', false);

-- ==============================================================================
-- 19. RECUPERACIÓN DE CONTRASEÑAS Y TOKENS OTP
-- ==============================================================================
CREATE TABLE IF NOT EXISTS codigos_recuperacion (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_codigos_recuperacion_email ON codigos_recuperacion(email);
CREATE INDEX IF NOT EXISTS idx_codigos_recuperacion_activo ON codigos_recuperacion(email, codigo, usado);

-- ==============================================================================
-- 20. AUDITORÍA DE TELEMETRÍA (INGRESOS A LA WEB Y APP MÓVIL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS telemetria_ingresos (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    plataforma VARCHAR(30) NOT NULL CHECK (plataforma IN ('web', 'app', 'movil')),
    rol VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    nombre VARCHAR(150),
    ip_origen VARCHAR(60),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_telemetria_fecha ON telemetria_ingresos(fecha);
CREATE INDEX IF NOT EXISTS idx_telemetria_plataforma ON telemetria_ingresos(plataforma);
CREATE INDEX IF NOT EXISTS idx_telemetria_rol ON telemetria_ingresos(rol);

-- ==============================================================================
-- 21. BITÁCORA DEL AGENTE MIPA (MOTOR PSICO-ACADÉMICO / IA)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bitacora_mipa (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    codigo_estudiante VARCHAR(50) NOT NULL,
    nombre_estudiante VARCHAR(150),
    grado VARCHAR(60),
    promedio NUMERIC(3,2),
    cumplimiento NUMERIC(5,2),
    dias_inactivo INTEGER DEFAULT 0,
    ira_score NUMERIC(5,4) NOT NULL,
    nivel_prioridad VARCHAR(30) NOT NULL CHECK (nivel_prioridad IN ('CRITICA', 'ALTA', 'MODERADA', 'PREVENTIVA')),
    clasificacion_riesgo VARCHAR(50) NOT NULL,
    diagnostico_tecnico TEXT,
    origen_analisis VARCHAR(50) DEFAULT 'gemini-2.5-flash',
    json_completo JSONB
);

CREATE INDEX IF NOT EXISTS idx_bitacora_mipa_estudiante ON bitacora_mipa(codigo_estudiante);
CREATE INDEX IF NOT EXISTS idx_bitacora_mipa_prioridad ON bitacora_mipa(nivel_prioridad);
CREATE INDEX IF NOT EXISTS idx_bitacora_mipa_fecha ON bitacora_mipa(fecha);

