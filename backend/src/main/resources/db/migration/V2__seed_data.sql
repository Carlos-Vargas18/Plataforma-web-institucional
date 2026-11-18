-- =================================================================================
-- MIGRACIÓN FLYWAY V2: DATOS SEMILLA CON INTEGRIDAD REFERENCIAL CORREGIDA
-- Compatible e idempotente (ON CONFLICT DO NOTHING)
-- =================================================================================

-- Nota: El componente DataInitializer de Spring Boot garantiza la creación y verificación
-- de hashes BCrypt y entidades relacionales completas si la base de datos está vacía.
-- Este script asegura los catálogos base en PostgreSQL.

INSERT INTO anios_lectivos (anio, fecha_inicio, fecha_fin, resolucion_rectoral, activo) VALUES
(2025, '2025-01-20', '2025-11-30', 'RES-RECT-001-2025', TRUE)
ON CONFLICT (anio) DO NOTHING;

INSERT INTO grados (nombre, nivel, numero_orden) VALUES
('Sexto (6°)', 'SECUNDARIA', 6),
('Séptimo (7°)', 'SECUNDARIA', 7),
('Octavo (8°)', 'SECUNDARIA', 8),
('Noveno (9°)', 'SECUNDARIA', 9),
('Décimo (10°)', 'MEDIA_VOCACIONAL', 10),
('Undécimo (11°)', 'MEDIA_VOCACIONAL', 11)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO materias (codigo_oficial, nombre, area_conocimiento, horas_semanales, descripcion) VALUES
('MAT-10', 'Cálculo y Trigonometría', 'Matemáticas', 5, 'Análisis de funciones trigonométricas, límites y geometría analítica'),
('FIS-10', 'Física Mecánica', 'Ciencias Naturales', 4, 'Cinemática, leyes de Newton, conservación de energía y trabajo'),
('QUI-10', 'Química Inorgánica', 'Ciencias Naturales', 4, 'Estequiometría, tabla periódica, enlaces químicos y reacciones'),
('LEN-10', 'Lengua Castellana y Literatura', 'Humanidades', 4, 'Literatura española, comprensión lectora crítica y ensayo argumentativo'),
('ING-10', 'Inglés Avanzado B2', 'Idiomas Extranjeros', 3, 'Comunicación oral y escrita nivel intermedio-alto MCER'),
('INF-10', 'Ingeniería de Software y Algoritmos', 'Tecnología e Informática', 3, 'Lógica de programación, bases de datos y desarrollo web')
ON CONFLICT (codigo_oficial) DO NOTHING;
