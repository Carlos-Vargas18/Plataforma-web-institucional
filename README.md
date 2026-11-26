# 🎓 EduConnect — Plataforma Web Institucional de Gestión Académica (v2.0)

**EduConnect** es una plataforma web institucional integral de gestión académica, convivencia escolar (Ley 1620 de 2013), evaluación bajo el **Decreto 1290 (SIEE 40% Saber / 30% Hacer / 30% Ser)** y analítica temprana de deserción estudiantil (**Motor MIPA**), desarrollada bajo una arquitectura empresarial desacoplada **React 19 + TypeScript + Spring Boot + Spring Security JWT + PostgreSQL / Supabase + Flyway**.

---

## 🏗️ 1. Arquitectura General del Sistema

La plataforma sigue una arquitectura **Cliente-Servidor Multicapa Estricta** donde el **100% de la lógica de negocio, autenticación, autorización RBAC, cálculo de promedios y persistencia** reside en el servidor **Spring Boot**:

```text
Plataforma-web-institucional/
├── frontend/                              # SPA React 19 + TypeScript 6 + Vite 8 + React Router 7
│   ├── public/IMG/                        # Activos institucionales unificados
│   ├── src/
│   │   ├── app/
│   │   │   ├── guards/ProtectedRoute.tsx  # Guardias de ruta por rol (RBAC cliente)
│   │   │   └── router/AppRouter.tsx       # Enrutamiento declarativo (/admin, /rector, /coordinador, /docente, /estudiante, /tutor)
│   │   ├── components/                    # Dashboards por rol, modales Decreto 1290, cuadrícula horaria y EduBot
│   │   ├── context/AuthContext.tsx        # Estado global de sesión verificado contra /api/v1/auth/me
│   │   ├── services/
│   │   │   ├── api/httpClient.ts          # Cliente HTTP centralizado con interceptor Bearer JWT y manejo 401/403
│   │   │   ├── api.ts                     # Capa de servicios REST 100% conectada a Spring Boot
│   │   │   ├── edubotBrain.ts             # Cliente del asistente institucional conectado a /api/v1/edubot/consulta
│   │   │   └── emailService.ts            # Cliente del servicio de recuperación conectado a /api/v1/auth/*
│   │   ├── test/app.test.ts               # Suite de pruebas unitarias Vitest
│   │   └── types/index.ts                 # Contratos TypeScript alineados con los DTOs de Spring Boot
├── backend/                               # API RESTful Java 21 + Spring Boot + Spring Security + JPA + Flyway
│   ├── src/main/java/com/educonnect/
│   │   ├── config/                        # SecurityConfig, CorsConfig, DataInitializer
│   │   ├── controller/                    # 11 Controladores REST (/api/v1/*)
│   │   ├── dto/                           # Contratos de entrada/salida con Jakarta Bean Validation
│   │   ├── exception/                     # GlobalExceptionHandler (@RestControllerAdvice) y excepciones de dominio
│   │   ├── model/                         # 25 Entidades JPA mapeadas a PostgreSQL
│   │   ├── repository/                    # 20 Repositorios Spring Data JPA
│   │   ├── security/                      # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
│   │   └── service/                       # Servicios transaccionales (@Transactional) de negocio y Decreto 1290
│   ├── src/main/resources/
│   │   ├── db/migration/                  # Migraciones versionadas Flyway (V1__init_schema.sql, V2__seed_data.sql)
│   │   ├── application.properties         # Configuración externalizada por variables de entorno (cero secretos en código)
│   │   └── application-local.properties   # Perfil de desarrollo local autogestionado
│   └── src/test/                          # Suite de pruebas de integración y seguridad (@SpringBootTest + MockMvc)
└── database/
    └── schema.sql                         # Esquema maestro PostgreSQL idempotente y no destructivo (25 tablas)
```

---

## 🔐 2. Seguridad y Control de Acceso (RBAC + Anti-IDOR)

1. **Autenticación Única en Servidor**:
   - Eliminada por completo cualquier dependencia de `@supabase/supabase-js` o `nodemailer` en el navegador.
   - Contraseñas almacenadas exclusivamente mediante **BCrypt (`BCryptPasswordEncoder`)**.
   - Control de intentos fallidos y bloqueo temporal de cuenta tras 5 intentos fallidos consecutivos.
2. **Tokens JWT Firmados (`HMAC-SHA`)**:
   - Emitidos en `POST /api/v1/auth/login` y validados en cada petición mediante `JwtAuthenticationFilter`.
   - Verificación activa de sesión al recargar la aplicación vía `GET /api/v1/auth/me`.
3. **Autorización por Rol y Propiedad del Recurso (Anti-IDOR)**:
   - `ADMIN` / `ADMINISTRATIVO`: Gestión de usuarios, grupos, materias, cargas académicas, comunicados y telemetría.
   - `RECTOR`: Resumen ejecutivo institucional, cierre/apertura de periodos académicos, resoluciones rectorales, aprobación/rechazo de solicitudes de modificación de nota en periodo cerrado y actas de promoción.
   - `COORDINADOR`: Casos de convivencia (Ley 1620), validación de excusas médicas, citaciones a padres, horarios escolares sin colisiones, auditoría de planillas y alertas MIPA.
   - `DOCENTE` / `DIRECTOR_GRUPO`: Registro de calificaciones Decreto 1290 únicamente en sus cargas académicas asignadas, control diario de asistencia, solicitudes de cambio de nota y dirección de grupo.
   - `ESTUDIANTE`: Consulta exclusiva de sus propias calificaciones, asistencias, horario, boletín oficial y firma de compromisos en el observador (bloqueo `403 Forbidden` ante intentos de consultar otros `estudianteId`).
   - `TUTOR`: Consulta exclusiva de sus estudiantes vinculados en `estudiante_tutor`, radicación de justificaciones de inasistencia, confirmación de citaciones y firma del observador.
4. **Recuperación de Contraseña Segura**:
   - Generación de código OTP de 6 dígitos con `SecureRandom` en el backend.
   - Almacenamiento del OTP cifrado con **BCrypt** en la tabla `codigos_recuperacion` con expiración de 15 minutos.
   - El código OTP **jamás** se devuelve en la respuesta HTTP al navegador.

---

## ⚙️ 3. Variables de Entorno

Configura estas variables en el entorno del proceso antes de iniciar el backend. Usa [`.env.example`](.env.example) como plantilla. Vite puede leer las variables del frontend desde [`frontend/.env.example`](frontend/.env.example) al copiarla a `frontend/.env`.

### Backend (`backend/`)
| Variable | Descripción | Valor por defecto (Desarrollo) |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Perfil de ejecución (`local` para H2 modo PostgreSQL, vacío para PostgreSQL/Supabase externo) | `local` |
| `DB_URL` | Cadena JDBC de PostgreSQL / Supabase Pooler | `jdbc:postgresql://localhost:5432/educonnect_db` |
| `DB_USERNAME` | Usuario de base de datos PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de base de datos PostgreSQL | *(vacío)* |
| `FLYWAY_ENABLED` | Activa migraciones automáticas Flyway en PostgreSQL | `true`. El perfil `local` lo desactiva para H2. |
| `JWT_SECRET` | Clave secreta de mínimo 32 caracteres para firmar tokens JWT | *(Clave CSPRNG efímera en dev)* |
| `JWT_EXPIRATION` | Tiempo de expiración del token JWT en milisegundos | `86400000` (24h) |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para CORS | `http://localhost:5173,http://localhost:3000` |
| `MAIL_HOST` | Servidor SMTP para envío de correos | `smtp.gmail.com` |
| `MAIL_PORT` | Puerto SMTP | `587` |
| `MAIL_USERNAME` | Cuenta de correo institucional remitente | *(vacío)* |
| `MAIL_PASSWORD` | Contraseña de aplicación SMTP | *(vacío)* |

### Frontend (`frontend/`)
| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL base del backend Spring Boot | `/api/v1` (proxy Vite a `http://localhost:8080`) |

---

## 🚀 4. Instrucciones de Instalación y Ejecución

### Requisitos Previos
- **Java JDK 21+**
- **Node.js 20.19+ dentro de la serie 20, o 22.12+**, y **npm**
- **PostgreSQL 15+** o proyecto en **Supabase** *(opcional en desarrollo local gracias al perfil `local` autogestionado)*

### Paso 1: Ejecutar el Backend (Spring Boot)
Para ejecutar inmediatamente en entorno local con base de datos en memoria compatible con PostgreSQL y semilla institucional precargada:
```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```
Para ejecutar conectado a **PostgreSQL / Supabase en la nube**:
```powershell
cd backend
$env:DB_URL="jdbc:postgresql://<HOST>:6543/postgres?sslmode=require&prepareThreshold=0"
$env:DB_USERNAME="<USUARIO_SUPABASE>"
$env:DB_PASSWORD="<PASSWORD_SUPABASE>"
$env:FLYWAY_ENABLED="true"
$env:JWT_SECRET="<TU_CLAVE_SECRETA_DE_MINIMO_32_CARACTERES>"
.\mvnw.cmd spring-boot:run
```
El servidor backend quedará activo en `http://localhost:8080`.

### Paso 2: Ejecutar el Frontend (React + Vite)
En una nueva terminal:
```powershell
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173` (con proxy automático de `/api` hacia `http://localhost:8080`).

---

## Despliegue de la demo

- En Vercel, usa `frontend` como directorio raíz. [`frontend/vercel.json`](frontend/vercel.json) configura Vite, `npm ci`, `npm run build`, la salida `dist` y la reescritura para React Router.
- Define `VITE_API_BASE_URL` en el entorno **Production** de Vercel con la URL HTTPS de la API pública, terminada en `/api/v1` y sin barra final. Esta variable se incorpora al JavaScript público.
- Para alojar la API en Render, selecciona un servicio web Docker con directorio raíz `backend` y `./Dockerfile` como ruta del Dockerfile. Usa PostgreSQL o Supabase de demo con `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `FLYWAY_ENABLED=true` y `JPA_DDL_AUTO=validate` en el entorno del servicio. Deja desactivado el perfil `local` y usa una base de demo con una cuenta de prueba activa. Configura `CORS_ALLOWED_ORIGINS` con el origen exacto del dominio de Vercel, sin barra final.
- Tras publicar, abre la URL de producción sin iniciar sesión en Vercel. Verifica el acceso con la cuenta de demo y recarga una ruta protegida. Las peticiones de la aplicación deben ir al origen HTTPS de la API.

## 🧪 5. Ejecución de Pruebas Automatizadas y Compilación

### Pruebas de Integración y Seguridad del Backend (JUnit 5 + Spring Security MockMvc)
Verifica autenticación BCrypt/JWT, bloqueo 401/403 RBAC, protección anti-IDOR, cálculo Decreto 1290 (40/30/30), bloqueo de periodos cerrados, no exposición de OTP ni `passwordHash`, y detección de colisiones de horario:
```powershell
cd backend
.\mvnw.cmd test
```

### Pruebas Unitarias y Compilación de Producción del Frontend (Vitest + TypeScript + Vite)
```powershell
cd frontend
npm test
npm run build
```

---

## 👥 6. Cuentas Institucionales Iniciales (Semilla de Desarrollo)

El perfil `local` y las pruebas automatizadas activan el inicializador de cuentas ficticias con BCrypt. En PostgreSQL, Flyway crea el esquema y carga los catálogos base. Las cuentas ficticias quedan desactivadas por defecto fuera del perfil `local`.

| Rol Institucional | Correo Electrónico | Ruta Protegida |
| :--- | :--- | :--- |
| **Administrador General (`ADMIN`)** | `admin@educonnect.com` | `/admin` |
| **Rectoría (`RECTOR`)** | `rector@educonnect.com` | `/rector` |
| **Coordinación (`COORDINADOR`)** | `coordinador@educonnect.com` | `/coordinador` |
| **Director de Grupo (`DIRECTOR_GRUPO`)** | `prof.silva@educonnect.com` | `/docente` |
| **Docente Titular (`DOCENTE`)** | `prof.gomez@educonnect.com` | `/docente` |
| **Estudiante (`ESTUDIANTE`)** | `carlosvargas@educonnect.com` | `/estudiante` |
| **Padre / Acudiente (`TUTOR`)** | `juan.ramirez@gmail.com` | `/tutor` |

En el perfil `local` las cuentas de prueba utilizan `APP_SEED_DEFAULT_PASSWORD` o, si no se configura, `123456`. Usa el mismo valor al ejecutar `npm run test:e2e` en una terminal con ambos servicios locales activos. La suite de navegador utiliza Microsoft Edge.
