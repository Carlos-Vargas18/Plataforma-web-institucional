# Auditoría ejecutada de EduConnect

## Inventario

React 19, TypeScript, Vite y React Router en la SPA. La API usa Spring Boot 4.1.3, Java 21 (JDK 22 en esta ejecución), Spring Security con JWT, BCrypt, JPA/Hibernate y Flyway. El perfil local usa H2 y el perfil por defecto usa PostgreSQL. Spring Mail integra SMTP para recuperación y bienvenida. EduBot consulta la API institucional. MIPA y telemetría usan datos de la aplicación. El boletín y el horario ofrecen impresión desde el navegador.

El portal público abre en `/`, con Inicio, Servicios, Plataformas, Filosofía, Docentes y Contacto. El acceso y la recuperación se presentan en `/login`. Los paneles de rol están en `/admin`, `/rector`, `/coordinador`, `/docente`, `/estudiante` y `/tutor`. `DIRECTOR_GRUPO` comparte la ruta docente y `ADMINISTRATIVO` tiene la misma ruta que `ADMIN` en el router.

Entidades JPA detectadas (25)

`anios_lectivos`, `asistencias`, `bitacora_mipa`, `calificaciones`, `carga_academica`, `casos_convivencia`, `citaciones_padres`, `codigos_recuperacion`, `comunicados`, `docentes`, `estudiantes`, `estudiante_tutor`, `grados`, `grupos`, `horarios_escolares`, `justificaciones_inasistencia`, `materias`, `matriculas`, `observador_estudiante`, `periodos_academicos`, `resoluciones_rectorales`, `solicitudes_modificacion_nota`, `telemetria_ingresos`, `tutores`, `usuarios`.

Endpoints declarados (62)

| Controlador | Métodos y rutas |
| --- | --- |
| `AdminController` | `GET /api/v1/admin/stats`<br>`GET /api/v1/admin/usuarios`<br>`POST /api/v1/admin/usuarios`<br>`PUT /api/v1/admin/usuarios/{id}`<br>`DELETE /api/v1/admin/usuarios/{id}`<br>`GET /api/v1/admin/grados`<br>`GET /api/v1/admin/grupos`<br>`POST /api/v1/admin/grupos`<br>`PUT /api/v1/admin/grupos/{id}`<br>`DELETE /api/v1/admin/grupos/{id}`<br>`GET /api/v1/admin/materias`<br>`POST /api/v1/admin/materias`<br>`PUT /api/v1/admin/materias/{id}`<br>`GET /api/v1/admin/cargas`<br>`POST /api/v1/admin/cargas`<br>`DELETE /api/v1/admin/cargas/{id}`<br>`GET /api/v1/admin/periodos` |
| `AsistenciaController` | `GET /api/v1/asistencias`<br>`POST /api/v1/asistencias`<br>`POST /api/v1/asistencias/planilla`<br>`GET /api/v1/asistencias/justificaciones`<br>`POST /api/v1/asistencias/justificaciones`<br>`PUT /api/v1/asistencias/justificaciones/{id}` |
| `AuthController` | `POST /api/v1/auth/login`<br>`GET /api/v1/auth/me`<br>`POST /api/v1/auth/register`<br>`POST /api/v1/auth/olvide-password`<br>`POST /api/v1/auth/verificar-codigo`<br>`POST /api/v1/auth/restablecer-password` |
| `BoletinController` | `GET /api/v1/boletines` |
| `CalificacionController` | `GET /api/v1/calificaciones`<br>`POST /api/v1/calificaciones`<br>`POST /api/v1/calificaciones/planilla`<br>`GET /api/v1/calificaciones/solicitudes`<br>`POST /api/v1/calificaciones/solicitudes` |
| `ComunicadoController` | `GET /api/v1/comunicados`<br>`POST /api/v1/comunicados`<br>`DELETE /api/v1/comunicados/{id}` |
| `ConvivenciaController` | `GET /api/v1/convivencia`<br>`POST /api/v1/convivencia`<br>`PUT /api/v1/convivencia/{id}` |
| `HorarioController` | `GET /api/v1/horarios`<br>`POST /api/v1/horarios`<br>`DELETE /api/v1/horarios/{id}` |
| `ObservadorCitacionController` | `GET /api/v1/observador`<br>`POST /api/v1/observador`<br>`PUT /api/v1/observador/{id}/firmar`<br>`GET /api/v1/citaciones`<br>`POST /api/v1/citaciones`<br>`PUT /api/v1/citaciones/{id}` |
| `PortalesRolController` | `GET /api/v1/docente/contexto`<br>`GET /api/v1/tutor/acudidos` |
| `RectorController` | `GET /api/v1/rector/resumen`<br>`GET /api/v1/rector/resoluciones`<br>`POST /api/v1/rector/resoluciones`<br>`PUT /api/v1/rector/periodos/{id}/estado`<br>`PUT /api/v1/rector/solicitudes-notas/{id}`<br>`GET /api/v1/rector/promocion` |
| `TelemetriaMipaController` | `GET /api/v1/telemetria/resumen`<br>`GET /api/v1/mipa/alertas-desercion`<br>`POST /api/v1/mipa/{id}/intervenir`<br>`POST /api/v1/edubot/consulta` |

## Estado inicial

- El arranque de Spring fallaba al compilar. El controlador de citaciones pasaba el usuario autenticado y el servicio conservaba la firma anterior.
- Vitest ejecutó 7 pruebas. Fallaron las dos de recuperación de sesión ante desconexión y 503. El cliente eliminaba el token ante cualquier error de `/auth/me`.
- Tras recuperar la compilación del backend, pasaron 10 pruebas de integración y fallaron las 3 pruebas existentes de precisión, año lectivo y rango de notas propuestas.
- Vite compiló. El bloque JavaScript inicial ocupaba 529,19 kB minificados y 137,05 kB comprimidos. La auditoría inicial de npm registró 3 paquetes afectados en la cadena de pruebas.

## Matriz de cobertura

«Aprobado» indica que se observó el resultado del caso descrito. La visita a una sección verifica la navegación de esa sección. Los flujos de escritura pendientes figuran en filas independientes.

| Rol y módulo | Resultado esperado | Comprobación y evidencia | Estado |
| --- | --- | --- | --- |
| Visitante · portal y acceso | Secciones públicas visibles. Acceso directo anónimo redirige. Credenciales incorrectas devuelven 401. | Playwright `public portal, invalid login and protected direct URL`. | Aprobado |
| ADMIN · panel general, usuarios, grupos, materias, cargas, horarios y comunicados | La cuenta abre `/admin` y puede navegar por sus secciones. | Playwright `login and reload admin…`. | Aprobado |
| ADMINISTRATIVO · directorio | El rol histórico conserva su identidad y puede consultar, paginar, buscar y filtrar en el directorio administrativo. | MockMvc `managesUserDirectoryOnlyAsAdministratorIncludingLegacyRole` y Playwright `legacy administrative role`. | Aprobado |
| RECTOR · resumen, auditoría, periodos, promoción, resoluciones, comunicados y MIPA | Redirección a `/rector` y navegación por las secciones disponibles. | Playwright `login and reload rector…`. | Aprobado |
| COORDINADOR · convivencia, observador, citaciones, excusas, planillas, horarios, comunicados y MIPA | Redirección a `/coordinador` y navegación por las secciones disponibles. | Playwright `login and reload coordinador…`. | Aprobado |
| DIRECTOR_GRUPO · planilla, asistencia, solicitudes, consolidado, observador, citaciones y horario | Redirección a `/docente` y acceso a sus secciones de dirección. | Playwright `login and reload prof.silva…`. | Aprobado |
| DOCENTE · planilla, asistencia, solicitudes y horario | Redirección a `/docente` y navegación por las secciones disponibles. | Playwright `login and reload prof.gomez…`. | Aprobado |
| ESTUDIANTE · notas, horario, observador, asistencia y circulares | Redirección a `/estudiante`, bloqueo del panel administrativo y acceso a sus secciones. | Playwright `login and reload carlosvargas…`. | Aprobado |
| TUTOR · boletín, horario, custodia, observador, citaciones y excusas | Redirección a `/tutor` y navegación por las secciones disponibles. | Playwright `login and reload juan.ramirez…`. | Aprobado |
| Todos los perfiles semilla · recarga y cierre | Recarga verificada con `/auth/me`. Una URL protegida vuelve al acceso tras cerrar sesión. | Playwright `login and reload` por cuenta. | Aprobado |
| Autenticación · cuenta deshabilitada y CORS | Cuenta deshabilitada devuelve 401 en el acceso y al usar un token emitido con anterioridad. Preflight permite el origen local y rechaza un origen ajeno. | MockMvc `disabledAccountCannotUseAnExistingTokenOrLogIn` y `corsAllowsLocalFrontendAndRejectsOtherOrigins`. | Aprobado |
| Autenticación · estado pendiente independiente | Identificar si existe un estado de aprobación separado. | `Usuario.estado` es booleano. La suite cubre cuenta deshabilitada. | No aplicable |
| Autenticación · recuperación de sesión | 503 y desconexión permiten reintentar. 401 vuelve al login. Una respuesta detenida deja el indicador de carga tras el límite. | Vitest `auth-session.test.tsx` y Playwright `session restoration` / `session verification`. | Aprobado |
| ADMIN · directorio y protección de datos | La API omite el hash, exige clave inicial y limita el directorio a administración. | MockMvc `testAdminUsersEndpointNeverExposesPasswordHash` y `managesUserDirectoryOnlyAsAdministratorIncludingLegacyRole`. | Aprobado |
| ADMIN · ciclo de una cuenta en PostgreSQL | Alta, consulta, edición y baja lógica del registro de prueba. | API 201/200/200; el directorio mostró «Actualizada Temporal» y JDBC confirmó `primer_nombre=Actualizada`, `rol=RECTOR`, `estado=false`. | Aprobado |
| ADMIN / COORDINADOR · catálogos | Alta, consulta y edición de grupo y materia; alta, consulta y baja de carga; baja de grupo sin dependencias. El formulario vincula al docente que corresponde al ID de usuario. | Recorrido REST `catalogos` y MockMvc `academicAssignmentAcceptsTeacherUserIdFromTheAdminForm`. | Aprobado |
| COORDINADOR / TUTOR / ESTUDIANTE · comunicados | La circular para tutores se muestra a ese destinatario. Se oculta de la lista y de EduBot para estudiantes. La baja la retira de la consulta. | Recorrido REST `comunicados` y MockMvc `filtersTargetedAnnouncementsInTheDirectoryAndEduBot`. | Aprobado |
| COORDINADOR · convivencia | Crear, consultar y cerrar un caso para la matrícula indicada. Rechazar matrícula ausente o inexistente. | Recorrido REST `convivencia` y MockMvc `convivenciaDoesNotSubstituteAnotherStudentForMissingEnrollment`. | Aprobado |
| COORDINADOR / TUTOR · observador y excusas | Crear anotación, consultarla y firmarla con tutor vinculado. Radicar y aprobar una excusa, y consultar la asistencia justificada. | Recorrido REST `observador` y `excusas`. | Aprobado |
| RECTOR / DIRECTOR_GRUPO · rectoría y solicitud | Crear y listar resolución, cerrar y reabrir periodo, consultar promoción y aprobar solicitud de cambio de nota. | Recorrido REST `rectoria` y `solicitud-nota`. | Aprobado |
| COORDINADOR / ESTUDIANTE / TUTOR · MIPA, EduBot y boletines | Consultar telemetría y alertas, registrar intervención en una alerta semilla, obtener respuesta institucional y consultar boletines autorizados. | Recorrido REST `mipa`, `edubot` y `boletin`, y controles MockMvc de boletín ajeno. | Aprobado |
| DOCENTE · notas y solicitud | Cálculo ponderado 40/30/30, redondeo a un decimal y bloqueo de periodos cerrados. Rechazo de componentes fuera de precisión, escala o año lectivo. | MockMvc `testTeacherRegistersDecreto1290GradesAndServerCalculatesWeightedAverage`, `testClosedPeriodBlocksGradeModification` y `CalificacionIntegrityTests`. | Aprobado |
| DOCENTE / ADMIN · asistencia y planillas | Una fecha inválida revierte el lote. Reintentar conserva una sola fila con los minutos y el texto enviados. El docente guarda cada planilla con una petición y ve confirmación. | MockMvc con consulta posterior directa al repositorio en `attendanceRollsBackPartialBatchAndKeepsOneRecordOnRetry` y Playwright `teacher saves grade and attendance registers`. | Aprobado |
| DOCENTE / DIRECTOR_GRUPO · alcance de consultas | Todas las variantes de consulta deben aplicar el mismo alcance académico del docente. | La revisión de `CalificacionService.consultarCalificaciones` y `AcademicoInstitucionalService.consultarAsistencias` encontró ramas de filtros que omiten el control docente que usa la ruta de consulta general. Las pruebas de estudiante y tutor no cubren esa diferencia. | Fallido |
| ESTUDIANTE · datos propios | El estudiante puede firmar su anotación. Otra cuenta devuelve 403. La API protege notas y boletín ajenos. | MockMvc `studentCanOnlySignOwnObservations` y `testStudentCannotQueryOtherStudentGradesOrBoletin`. | Aprobado |
| TUTOR · citaciones | El tutor puede confirmar su citación. Un rol ajeno y un cambio a «realizada» por el tutor devuelven 403. | MockMvc `tutorCanConfirmOwnCitationAndOtherRolesCannotModifyIt`. | Aprobado |
| ADMIN / COORDINADOR · horario | Rechazo de un bloque duplicado. Alta, filtro, persistencia tras recarga y borrado de un bloque ficticio. | MockMvc `testScheduleCollisionDetectionRejectsDuplicateSlot` y Playwright `admin creates, filters, reloads and deletes an isolated schedule block`. | Aprobado |
| ADMIN · horario concurrente | Dos altas simultáneas del mismo bloque dejan una fila. | Dos peticiones REST devolvieron 201 y 409. Un GET posterior encontró una sola coincidencia. | Aprobado |
| ADMIN, COORDINADOR, DOCENTE, ESTUDIANTE, TUTOR · horario | Fondo pastel, borde lateral, texto negro, hora y color estable por materia en paneles y recargas. | Playwright `admin header and schedule`, Edge a 1440 × 900 y 390 × 700, capturas en los resultados del navegador. | Aprobado |
| ADMIN · barra superior y diálogo | Fondo blanco opaco y posición superior al desplazar Usuarios y Horarios en escritorio y móvil. El diálogo aparece sobre la barra y devuelve el foco al cerrar con Escape. | Playwright mide desplazamiento, posición, color, capa y foco. | Aprobado |
| Recuperación · OTP | Respuesta sin código y persistencia del código con BCrypt. | MockMvc `testPasswordRecoveryDoesNotLeakOtpAndHashesInDatabase`. | Aprobado |
| Recuperación · transporte SMTP | Entrega, verificación y restablecimiento usando un buzón de pruebas local. | Receptor SMTP de loopback con destinatario `example.test`. Restablecimiento 200, reutilización del código 400, clave anterior 401 y nueva 200. | Aprobado |
| Recuperación · entrega externa | Verificar autenticación y TLS del proveedor institucional. | Requiere un proveedor o servidor TLS de pruebas y credenciales autorizadas para ese destino. | Bloqueado |
| Cuentas · baja institucional frente a bloqueo temporal | La recuperación debe respetar una baja institucional. | La revisión de `AuthService.restablecerPassword` encontró que la recuperación y la baja reutilizan el mismo estado booleano. Queda pendiente distinguirlos en el modelo y verificar esa transición. | Fallido |
| ADMIN · edición concurrente de una cuenta | Registrar qué ocurre con dos cambios sobre el mismo registro. | Ambas ediciones devolvieron 200. La base conservó uno de los cambios y la API no comunicó conflicto. La política de sobrescritura queda registrada en la evidencia. | Aprobado |
| Asistencia y notas · edición simultánea | Aplicar la política de resolución de conflicto que corresponda a dos cambios simultáneos en una fila de planilla. | Se comprobó reversión y reintento de asistencia. Falta definir si se permiten sobrescrituras en planillas o se debe avisar y rechazar una edición desactualizada. Queda pendiente la prueba de reversión específica de notas. | Bloqueado |
| Impresión y PDF del navegador | Horario y boletín invocan la impresión y generan un PDF con los controles ocultos. | Edge en modo impresión produjo dos PDF de prueba. Detalle en `.codex/educonnect-print-evidence.json`. | Aprobado |
| Exportación CSV | Confirmar disponibilidad de descarga tabular independiente. | La revisión de las vistas y servicios encontró impresión de navegador y ningún flujo CSV activo. | No aplicable |
| Accesibilidad | Etiquetas asociadas, foco visible, contraste y uso por teclado en formularios y tablas. | Se asociaron las etiquetas del formulario compartido y se añadió foco visible a la tabla desplazable. Pendiente recorrido integral teclado, zoom y tecnologías de asistencia en todos los paneles. | Bloqueado |
| PostgreSQL · instalación y actualización | V1/V2 en una base vacía, arranque con `ddl-auto=validate`, actualización de una base V1 y conservación de una fila previa. | PostgreSQL 16.16 local en `127.0.0.1:55432`. Flyway registró V1 y V2 exitosas. La materia previa `MAT-10` mantuvo su nombre y quedaron 6 materias. | Aprobado |
| Entornos desplegados | Acceso y migraciones en destinos externos. | El alcance fue local. | No aplicable |

## Causas y correcciones

| Área | Causa observada y corrección |
| --- | --- |
| Sesión | La captura genérica eliminaba el JWT ante fallos transitorios. Se mantiene el token para reintentar, se vuelve al acceso al rechazar la sesión y se limita la espera HTTP a 15 segundos. Una respuesta de una sesión anterior no invalida la sesión nueva. El punto de entrada montaba otro proveedor de sesión alrededor del que ya tenía la aplicación y disparaba una verificación duplicada en producción. |
| Citaciones, observador y excusas | Faltaba completar la identidad del actor en citaciones y había búsquedas que podían tomar el primer acudiente o matrícula. Se comprobaron autoría, vínculo y propiedad según el recurso. Las referencias de matrícula ausentes, desconocidas o ambiguas producen un error explícito. |
| Directorio y datos de cuenta | La regla general para `GET /admin/**` permitía consultar datos del directorio desde roles sin ese módulo. El directorio aplica una regla de administración. Se da la autoridad administrativa al alias histórico y el alta exige una contraseña inicial. |
| Cargas y casos de convivencia | El formulario de carga enviaba el ID del usuario docente y la API solo resolvía el ID del perfil. Se incorporó la búsqueda por ID de usuario. En convivencia, una matrícula inválida podía sustituirse por la primera disponible. La referencia inválida ahora se rechaza. |
| Comunicados | La lista y la respuesta de EduBot leían todos los comunicados activos. Ambas usan la visibilidad según destinatario y rol. La interfaz de administración conserva visibilidad sobre las publicaciones que gestiona. |
| Calificaciones y asistencia | Faltaban validaciones de precisión y año lectivo en el flujo de notas. Los registros de planilla se guardaban fila por fila desde el cliente. Se añadieron validaciones y se guarda cada planilla en una transacción. La asistencia conserva los minutos enviados y limpia el retraso cuando cambia el estado. |
| Horarios | El componente compartido usaba el mismo fondo para todas las materias. El ID elige una de 24 variantes derivadas de los seis tonos de las tarjetas. Nombre y hora permanecen visibles cuando dos IDs coinciden en una variante. El servidor valida referencias, día, franja y longitud del aula. |
| Barra de administración | La regla compartida dejaba separación superior y aplicaba transparencia. En administración el encabezado se fija al borde superior del documento, con fondo blanco y espacio de desplazamiento para el contenido enfocado. La barra lateral expandida interceptaba el clic de guardado en escritorio. Ahora ocupa espacio en el layout administrativo. |
| PostgreSQL y datos ficticios | Se incluía la biblioteca Flyway sin el módulo de autoconfiguración de Spring Boot 4. Se incorporó el módulo de arranque. Los perfiles de prueba activan la semilla de usuarios; el perfil por defecto aplica solo los catálogos SQL de Flyway. Los logs SMTP omiten destinatarios y mensajes de error del proveedor. |
| Dependencias frontend | Las incidencias iniciales estaban en Vitest y sus dependencias de desarrollo. El lockfile pasa a Vitest 4.1.12 y la auditoría final de npm devuelve cero. |
| Dependencias backend | OSV detectó avisos en cinco coordenadas de Jackson 2/3 y Tomcat. Spring Boot pasa de 4.1.1 a 4.1.3, que resuelve Jackson 2.21.8 y 3.1.8 y Tomcat 11.0.27. La consulta posterior de 140 coordenadas Maven devolvió cero coincidencias. |

Referencia técnica para la autoconfiguración de Flyway. [Spring Boot · Database Initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html#howto.data-initialization.migration-tool.flyway)

## Comandos y resultados

| Comprobación | Comando | Resultado |
| --- | --- | --- |
| Instalación frontend | `npm.cmd ci` en `frontend` | Aprobado con el lockfile actualizado. Se usó npm 11 para regenerarlo tras un error `edgesOut` de npm 10. |
| Arranque local | `mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"`, luego `java -jar … --spring.profiles.active=local` y `vite.cmd --host 127.0.0.1 --port 5173 --strictPort` | Aprobado con H2, API en 8080 y frontend en 5173. SMTP apunta a loopback y las cuentas son ficticias. |
| Compilación y tipos frontend | `npm.cmd run build` y `tsc.cmd --noEmit` | Aprobado. |
| Vitest con cobertura | `vitest.cmd run --environment jsdom --coverage src/test` | 7/7. 46,33 % de líneas y 51,80 % de ramas en los archivos incluidos en el reporte. |
| Auditoría npm | `npm.cmd audit` | De 3 paquetes afectados a 0 al actualizar Vitest y su lockfile. |
| Compilación y pruebas Java | `mvnw.cmd -B -ntp clean verify`, ejecuciones focalizadas de las regresiones y verificación final con JaCoCo | 22/22 en la verificación final. JAR generado. JaCoCo midió 1096/2418 líneas y 315/1257 ramas. |
| JaCoCo | `mvnw.cmd -B -ntp org.jacoco:jacoco-maven-plugin:0.8.14:prepare-agent verify org.jacoco:jacoco-maven-plugin:0.8.14:report` | Reporte en `backend/target/site/jacoco/index.html`; cobertura inferior al 80 % de referencia. |
| Lint frontend | `npm run lint` | Bloqueado. El proyecto no define ese script ni configuración de lint. |
| Flyway / PostgreSQL | `initdb`, `pg_ctl`, `java -jar …` con `DB_URL` de loopback y `JPA_DDL_AUTO=validate`. Se arranca la base de actualización con `--spring.flyway.target=1`, se inserta una materia por JDBC y se reinicia sin el límite. | V1/V2 aprobadas en la base nueva y en la actualización. Spring Boot 4.1.3 reinició con esquema en V2 y Flyway lo validó sin migraciones pendientes. |
| Regresión de navegador | `playwright.cmd test --reporter=line,json` en `frontend`, con ambos servicios locales | 15/15. Resultado y tiempos por rol en `.codex/educonnect-browser-report.json`. Capturas en `.codex/playwright-results`. |
| Dependencias Maven | `mvnw.cmd dependency:tree -DoutputType=json` y consulta de las coordenadas resueltas en OSV | 140 coordenadas consultadas. De cinco coordenadas con avisos a cero. OWASP Dependency-Check no estaba disponible en el primer intento offline. |
| Estático Java | `mvnw.cmd com.github.spotbugs:spotbugs-maven-plugin:check`, `mvnw.cmd org.apache.maven.plugins:maven-pmd-plugin:check` y `mvnw.cmd org.apache.maven.plugins:maven-checkstyle-plugin:check` | Fallido. SpotBugs pasó de 16 a 14 avisos tras proteger las listas de entrada. PMD y Checkstyle registraron 17 y 2591 avisos con sus reglas predeterminadas, respectivamente. La comprobación Maven `verify` aprobó. |
| Recorridos REST y SMTP | Peticiones HTTP con cuentas de prueba mediante Python y SMTP de loopback para el código de recuperación | 11/11 recorridos REST y 54 comprobaciones HTTP en `.codex/educonnect-api-module-evidence.json`. Resultados en `.codex/educonnect-smtp-evidence.txt` y `.codex/educonnect-concurrency-evidence.json`. |
| Revisión de diferencias | `git status --short`, `git diff --check`, revisión del diff | Se preservaron cambios que ya estaban en el árbol. |

## Rendimiento local

Se hicieron tres recargas de la página de administración con Edge contra el build de producción servido por Vite Preview. Tras quitar el proveedor de sesión duplicado, `/auth/me` pasó de 2 a 1 petición en cada muestra y el total de peticiones de la API pasó de 9 a 8. La mediana hasta el encabezado fue de 375 ms antes y 451 ms después. La mediana hasta completar la respuesta de estadísticas fue de 580 ms antes y 718 ms después. En estas muestras hubo menos solicitudes y la latencia medida fue mayor en la segunda tanda. Los datos están en `.codex/educonnect-performance-before.json` y `.codex/educonnect-performance-after.json`.

Las planillas ya envían una petición por lote, en lugar de una por fila. El navegador confirmó el POST y el mensaje de guardado en notas y asistencia. La cobertura de tiempos en condiciones de carga representativa, el perfil de SQL bajo volumen institucional y la política de conflictos al editar simultáneamente una fila siguen pendientes.

## Archivos modificados en esta auditoría

- Backend, arranque y seguridad. `pom.xml`, `config/DataInitializer.java`, `model/Rol.java`, `security/CustomUserDetailsService.java`, `security/SecurityConfig.java`, `service/AdminService.java`, `service/EmailService.java`, `service/GobiernoYAnaliticaService.java`, y los archivos `application-local.properties` y `src/test/resources/application.properties`.
- Backend, flujos y regresión. `controller/AdminController.java`, `controller/AsistenciaController.java`, `controller/CalificacionController.java`, `controller/ComunicadoController.java`, `dto/CalificacionRequest.java`, `service/AcademicoInstitucionalService.java`, `service/CalificacionService.java` y `EduconnectBackendApplicationTests.java`.
- Frontend, sesión y planillas. `src/main.tsx`, `src/context/AuthContext.tsx`, `src/app/guards/ProtectedRoute.tsx`, `src/services/api/httpClient.ts`, `src/services/api.ts` y `src/components/DocenteDashboard.tsx`.
- Frontend, horario y administración. `src/components/HorarioSemanalGrid.tsx`, `src/components/AdminDashboard.tsx`, `src/components/ui/DashboardShared.tsx` y `src/styles/dashboard.css`.
- Dependencias, automatización y documentación. `frontend/package.json`, `frontend/package-lock.json`, `frontend/playwright.config.ts`, `frontend/e2e/educonnect.spec.ts`, `README.md` y este informe.

Se utilizaron las siete skills solicitadas. El perfil local, la semilla de prueba, los endpoints y los guardias se contrastaron con el código y las pruebas. Los cambios previos del usuario en el filtro JWT, el controlador de citaciones, el repositorio de excusas y las pruebas de integridad y sesión formaron parte de la base de trabajo.
