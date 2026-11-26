package com.educonnect.config;

import com.educonnect.model.*;
import com.educonnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final DocenteRepository docenteRepository;
    private final TutorRepository tutorRepository;
    private final EstudianteRepository estudianteRepository;
    private final EstudianteTutorRepository estudianteTutorRepository;
    private final AnioLectivoRepository anioLectivoRepository;
    private final PeriodoAcademicoRepository periodoRepository;
    private final GradoRepository gradoRepository;
    private final MateriaRepository materiaRepository;
    private final GrupoRepository grupoRepository;
    private final CargaAcademicaRepository cargaRepository;
    private final MatriculaRepository matriculaRepository;
    private final CalificacionRepository calificacionRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final HorarioEscolarRepository horarioRepository;
    private final ComunicadoRepository comunicadoRepository;
    private final ObservadorEstudianteRepository observadorRepository;
    private final CitacionPadreRepository citacionRepository;
    private final CasoConvivenciaRepository convivenciaRepository;
    private final ResolucionRectoralRepository resolucionRepository;
    private final SolicitudModificacionNotaRepository solicitudNotaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-password:}")
    private String configuredSeedPassword;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        if (usuarioRepository.count() > 0) {
            log.info("Base de datos EduConnect ya cuenta con {} usuarios registrados.", usuarioRepository.count());
            return;
        }

        if (configuredSeedPassword.isBlank()) {
            throw new IllegalStateException("Configure una contraseña para habilitar la semilla de pruebas.");
        }
        String bcryptHash = passwordEncoder.encode(configuredSeedPassword);

        log.info("Inicializando catálogo institucional EduConnect en Base de Datos con integridad referencial verificada...");

        // 1. USUARIOS INSTITUCIONALES (Todos con BCrypt real)
        Usuario uAdmin = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("1010101010").email("admin@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ADMIN)
                .primerNombre("Carlos").segundoNombre("Andrés").primerApellido("Mendoza").segundoApellido("Silva")
                .telefono("3001112233").direccion("Sede Administrativa Central").estado(true).build());

        Usuario uRector = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("2020202020").email("rector@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.RECTOR)
                .primerNombre("Fernando").segundoNombre("José").primerApellido("Gaviria").segundoApellido("Restrepo")
                .telefono("3002223344").direccion("Despacho Rectoral").estado(true).build());

        Usuario uCoord = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("3030303030").email("coordinador@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.COORDINADOR)
                .primerNombre("Patricia").segundoNombre("Elena").primerApellido("Suárez").segundoApellido("Vega")
                .telefono("3003334455").direccion("Coordinación Académica y Convivencia").estado(true).build());

        Usuario uDirGrupo = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("4040404040").email("prof.silva@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DIRECTOR_GRUPO)
                .primerNombre("Roberto").segundoNombre("Arturo").primerApellido("Silva").segundoApellido("Pineda")
                .telefono("3104445566").direccion("Departamento de Matemáticas").estado(true).build());

        Usuario uDocente = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("5050505050").email("prof.gomez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DOCENTE)
                .primerNombre("Elena").segundoNombre("Marcela").primerApellido("Gómez").segundoApellido("Castro")
                .telefono("3115556677").direccion("Departamento de Ciencias Naturales").estado(true).build());

        Usuario uTutor = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789456").email("juan.ramirez@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Juan").segundoNombre("Fernando").primerApellido("Ramírez").segundoApellido("Ochoa")
                .telefono("3156667788").direccion("Cra 70 #45-12 Medellín").estado(true).build());

        Usuario uEstCarlos = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1001234567").email("carlosvargas@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Carlos").segundoNombre("David").primerApellido("Vargas").segundoApellido("Montoya")
                .telefono("3207778899").direccion("Calle 50 #30-15").estado(true).build());

        Usuario uEstSofia = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1009876543").email("sofia.ramirez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Sofía").segundoNombre("Valentina").primerApellido("Ramírez").segundoApellido("Gómez")
                .telefono("3208889900").direccion("Cra 70 #45-12").estado(true).build());

        // 2. DOCENTES (Con usuario_id correctamente vinculado)
        Docente docSilva = docenteRepository.save(Docente.builder()
                .usuario(uDirGrupo).codigoEmpleado("DOC-2025-001")
                .especialidad("Matemáticas y Cálculo").tituloProfesional("Magíster en Enseñanza de las Ciencias Exactas")
                .escalafon("Grado 3A").fechaVinculacion(LocalDate.of(2019, 2, 1)).activo(true).build());

        Docente docGomez = docenteRepository.save(Docente.builder()
                .usuario(uDocente).codigoEmpleado("DOC-2025-002")
                .especialidad("Física y Química").tituloProfesional("Licenciada en Física y Ciencias Naturales")
                .escalafon("Grado 2B").fechaVinculacion(LocalDate.of(2021, 1, 18)).activo(true).build());

        // 3. TUTORES Y ESTUDIANTES (Con usuario_id correctamente vinculado)
        Tutor tutorJuan = tutorRepository.save(Tutor.builder()
                .usuario(uTutor).ocupacion("Ingeniero Civil").empresaTrabajo("Constructora Antioquia S.A.")
                .telefonoEmergencia("3156667788").correoAlternativo("jframirez@constructora.co").autorizadoRecoger(true).build());

        Estudiante estCarlos = estudianteRepository.save(Estudiante.builder()
                .usuario(uEstCarlos).codigoEstudiantil("EST-2025-1001")
                .fechaNacimiento(LocalDate.of(2009, 4, 14)).genero("M").rhGrupoSanguineo("O+")
                .eps("Sura EPS").estrato(3).estadoAcademico("ACTIVO").build());

        Estudiante estSofia = estudianteRepository.save(Estudiante.builder()
                .usuario(uEstSofia).codigoEstudiantil("EST-2025-1002")
                .fechaNacimiento(LocalDate.of(2009, 8, 22)).genero("F").rhGrupoSanguineo("A+")
                .eps("Sanitas EPS").estrato(4).estadoAcademico("ACTIVO").build());

        estudianteTutorRepository.save(EstudianteTutor.builder()
                .estudiante(estCarlos).tutor(tutorJuan).parentesco("PADRE")
                .esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());

        estudianteTutorRepository.save(EstudianteTutor.builder()
                .estudiante(estSofia).tutor(tutorJuan).parentesco("PADRE")
                .esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());

        // 4. AÑO LECTIVO Y PERIODOS ACADÉMICOS
        AnioLectivo anio2025 = anioLectivoRepository.save(AnioLectivo.builder()
                .anio(2025).fechaInicio(LocalDate.of(2025, 1, 20)).fechaFin(LocalDate.of(2025, 11, 30))
                .resolucionRectoral("RES-RECT-2025-001").activo(true).build());

        PeriodoAcademico p1 = periodoRepository.save(PeriodoAcademico.builder()
                .anioLectivo(anio2025).numeroPeriodo(1).nombre("Primer Periodo")
                .porcentajeValor(new BigDecimal("25.00"))
                .fechaInicio(LocalDate.of(2025, 1, 20)).fechaFin(LocalDate.of(2025, 4, 4))
                .fechaCierreNotas(LocalDateTime.of(2025, 4, 10, 23, 59)).cerrado(false).build());

        PeriodoAcademico p2 = periodoRepository.save(PeriodoAcademico.builder()
                .anioLectivo(anio2025).numeroPeriodo(2).nombre("Segundo Periodo")
                .porcentajeValor(new BigDecimal("25.00"))
                .fechaInicio(LocalDate.of(2025, 4, 7)).fechaFin(LocalDate.of(2025, 6, 20))
                .fechaCierreNotas(LocalDateTime.of(2025, 6, 25, 23, 59)).cerrado(false).build());

        periodoRepository.save(PeriodoAcademico.builder()
                .anioLectivo(anio2025).numeroPeriodo(3).nombre("Tercer Periodo")
                .porcentajeValor(new BigDecimal("25.00"))
                .fechaInicio(LocalDate.of(2025, 7, 14)).fechaFin(LocalDate.of(2025, 9, 19))
                .fechaCierreNotas(LocalDateTime.of(2025, 9, 25, 23, 59)).cerrado(false).build());

        periodoRepository.save(PeriodoAcademico.builder()
                .anioLectivo(anio2025).numeroPeriodo(4).nombre("Cuarto Periodo")
                .porcentajeValor(new BigDecimal("25.00"))
                .fechaInicio(LocalDate.of(2025, 9, 22)).fechaFin(LocalDate.of(2025, 11, 28))
                .fechaCierreNotas(LocalDateTime.of(2025, 11, 30, 23, 59)).cerrado(false).build());

        // 5. GRADOS, MATERIAS, GRUPOS Y CARGAS ACADÉMICAS
        Grado g9 = gradoRepository.save(Grado.builder().nombre("Noveno (9°)").nivel("SECUNDARIA").numeroOrden(9).build());
        Grado g10 = gradoRepository.save(Grado.builder().nombre("Décimo (10°)").nivel("MEDIA_VOCACIONAL").numeroOrden(10).build());
        Grado g11 = gradoRepository.save(Grado.builder().nombre("Undécimo (11°)").nivel("MEDIA_VOCACIONAL").numeroOrden(11).build());

        Materia matCalculo = materiaRepository.save(Materia.builder()
                .codigoOficial("MAT-10").nombre("Cálculo y Trigonometría").areaConocimiento("Matemáticas")
                .horasSemanales(5).descripcion("Funciones trigonométricas, identidades y límites").activa(true).build());
        Materia matFisica = materiaRepository.save(Materia.builder()
                .codigoOficial("FIS-10").nombre("Física Mecánica").areaConocimiento("Ciencias Naturales")
                .horasSemanales(4).descripcion("Cinemática, leyes de Newton y conservación de energía").activa(true).build());
        Materia matQuimica = materiaRepository.save(Materia.builder()
                .codigoOficial("QUI-10").nombre("Química Inorgánica").areaConocimiento("Ciencias Naturales")
                .horasSemanales(4).descripcion("Enlaces químicos, estequiometría y reacciones").activa(true).build());
        Materia matSoftware = materiaRepository.save(Materia.builder()
                .codigoOficial("INF-10").nombre("Ingeniería de Software y Algoritmos").areaConocimiento("Tecnología e Informática")
                .horasSemanales(3).descripcion("Estructuras de datos, SQL y arquitectura web").activa(true).build());

        Grupo grupo10A = grupoRepository.save(Grupo.builder()
                .anioLectivo(anio2025).grado(g10).codigoGrupo("10-A").directorGrupo(docSilva)
                .salonAula("Aula 201 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo10B = grupoRepository.save(Grupo.builder()
                .anioLectivo(anio2025).grado(g10).codigoGrupo("10-B").directorGrupo(docGomez)
                .salonAula("Aula 202 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        grupoRepository.save(Grupo.builder()
                .anioLectivo(anio2025).grado(g11).codigoGrupo("11-A").directorGrupo(null)
                .salonAula("Aula 301 - Bloque C").jornada("MAÑANA").cupoMaximo(35).build());

        CargaAcademica cargaCalc10A = cargaRepository.save(CargaAcademica.builder()
                .grupo(grupo10A).materia(matCalculo).docente(docSilva).intensidadHoraria(5).build());
        CargaAcademica cargaFis10A = cargaRepository.save(CargaAcademica.builder()
                .grupo(grupo10A).materia(matFisica).docente(docGomez).intensidadHoraria(4).build());
        CargaAcademica cargaQui10A = cargaRepository.save(CargaAcademica.builder()
                .grupo(grupo10A).materia(matQuimica).docente(docGomez).intensidadHoraria(4).build());
        CargaAcademica cargaSoft10A = cargaRepository.save(CargaAcademica.builder()
                .grupo(grupo10A).materia(matSoftware).docente(docSilva).intensidadHoraria(3).build());

        // 6. MATRÍCULAS Y CALIFICACIONES DECRETO 1290
        Matricula matCarlos = matriculaRepository.save(Matricula.builder()
                .folioMatricula("MAT-2025-1001").estudiante(estCarlos).grupo(grupo10A).anioLectivo(anio2025)
                .pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());

        Matricula matSofia = matriculaRepository.save(Matricula.builder()
                .folioMatricula("MAT-2025-1002").estudiante(estSofia).grupo(grupo10A).anioLectivo(anio2025)
                .pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());

        calificacionRepository.save(Calificacion.builder()
                .matricula(matCarlos).cargaAcademica(cargaCalc10A).periodo(p1)
                .notaCognitiva(new BigDecimal("4.5")).notaProcedimental(new BigDecimal("4.6")).notaActitudinal(new BigDecimal("4.8"))
                .notaDefinitivaPeriodo(new BigDecimal("4.6")).escalaDesempeno("SUPERIOR")
                .juicioValorativo("Excelente dominio de identidades trigonométricas y modelado matemático.")
                .modificadoPor(uDirGrupo).build());

        calificacionRepository.save(Calificacion.builder()
                .matricula(matCarlos).cargaAcademica(cargaFis10A).periodo(p1)
                .notaCognitiva(new BigDecimal("4.2")).notaProcedimental(new BigDecimal("4.0")).notaActitudinal(new BigDecimal("4.4"))
                .notaDefinitivaPeriodo(new BigDecimal("4.2")).escalaDesempeno("ALTO")
                .juicioValorativo("Resuelve con solvencia problemas de cinemática y dinámica.")
                .modificadoPor(uDocente).build());

        calificacionRepository.save(Calificacion.builder()
                .matricula(matCarlos).cargaAcademica(cargaSoft10A).periodo(p1)
                .notaCognitiva(new BigDecimal("4.8")).notaProcedimental(new BigDecimal("4.7")).notaActitudinal(new BigDecimal("4.9"))
                .notaDefinitivaPeriodo(new BigDecimal("4.8")).escalaDesempeno("SUPERIOR")
                .juicioValorativo("Destacada capacidad de abstracción algorítmica y diseño de bases de datos.")
                .modificadoPor(uDirGrupo).build());

        calificacionRepository.save(Calificacion.builder()
                .matricula(matSofia).cargaAcademica(cargaCalc10A).periodo(p1)
                .notaCognitiva(new BigDecimal("2.8")).notaProcedimental(new BigDecimal("2.9")).notaActitudinal(new BigDecimal("3.2"))
                .notaDefinitivaPeriodo(new BigDecimal("3.0")).escalaDesempeno("BASICO")
                .juicioValorativo("Supera los logros básicos; se sugiere refuerzo en resolución de ecuaciones.")
                .modificadoPor(uDirGrupo).build());

        // 7. ASISTENCIAS, HORARIOS, COMUNICADOS, OBSERVADOR, CITACIONES, CONVIVENCIA Y RESOLUCIONES
        asistenciaRepository.save(Asistencia.builder()
                .matricula(matCarlos).cargaAcademica(cargaCalc10A).periodo(p1)
                .fechaClase(LocalDate.now().minusDays(2)).estadoAsistencia("PRESENTE").justificada(false).build());
        asistenciaRepository.save(Asistencia.builder()
                .matricula(matCarlos).cargaAcademica(cargaFis10A).periodo(p1)
                .fechaClase(LocalDate.now().minusDays(1)).estadoAsistencia("AUSENTE").justificada(false)
                .observacion("Inasistencia pendiente de soporte médico").build());
        asistenciaRepository.save(Asistencia.builder()
                .matricula(matSofia).cargaAcademica(cargaCalc10A).periodo(p1)
                .fechaClase(LocalDate.now().minusDays(2)).estadoAsistencia("AUSENTE").justificada(false)
                .observacion("Inasistencia reportada en primera hora").build());

        horarioRepository.save(HorarioEscolar.builder()
                .anioLectivo(anio2025).grupo(grupo10A).materia(matCalculo).docente(docSilva)
                .diaSemana("LUNES").bloqueOrden(1).horaInicio(LocalTime.of(7, 0)).horaFin(LocalTime.of(8, 0)).aula("Aula 201").build());
        horarioRepository.save(HorarioEscolar.builder()
                .anioLectivo(anio2025).grupo(grupo10A).materia(matFisica).docente(docGomez)
                .diaSemana("MARTES").bloqueOrden(2).horaInicio(LocalTime.of(8, 0)).horaFin(LocalTime.of(9, 0)).aula("Lab Física 1").build());
        horarioRepository.save(HorarioEscolar.builder()
                .anioLectivo(anio2025).grupo(grupo10A).materia(matSoftware).docente(docSilva)
                .diaSemana("MIERCOLES").bloqueOrden(4).horaInicio(LocalTime.of(10, 30)).horaFin(LocalTime.of(11, 30)).aula("Sala Sistemas 2").build());
        horarioRepository.save(HorarioEscolar.builder()
                .anioLectivo(anio2025).grupo(grupo10A).materia(matQuimica).docente(docGomez)
                .diaSemana("JUEVES").bloqueOrden(1).horaInicio(LocalTime.of(7, 0)).horaFin(LocalTime.of(8, 0)).aula("Lab Química").build());

        comunicadoRepository.save(Comunicado.builder()
                .autor(uRector).titulo("Cronograma Oficial de Evaluación Decreto 1290 — Primer Semestre")
                .contenido("Se informa a la comunidad educativa que el registro de calificaciones cognitivas (40%), procedimentales (30%) y actitudinales (30%) se encuentra habilitado en el sistema centralizado.")
                .destinatarioRol("TODOS").importancia("ALTA").activo(true).build());

        observadorRepository.save(ObservadorEstudiante.builder()
                .matricula(matCarlos).autor(uDirGrupo).periodo(p1)
                .fechaSuceso(LocalDate.now().minusDays(5)).tipoAnotacion("FELICITACION").categoriaFalta("NO_APLICA")
                .descripcionHechos("Liderazgo sobresaliente en las Olimpiadas Institucionales de Matemáticas y Algoritmia.")
                .compromisosAcordados("Continuar representando al grupo 10-A en el semillero de investigación.")
                .firmadoEstudiante(true).firmadoAcudiente(true).build());

        citacionRepository.save(CitacionPadre.builder()
                .estudiante(estSofia).tutor(tutorJuan).convocadoPor(uDirGrupo)
                .fechaHoraCita(LocalDateTime.now().plusDays(3).withHour(9).withMinute(0))
                .lugarOEnlace("Sala de Atención a Padres - Bloque Administrativo")
                .motivoCitacion("Socialización de plan de acompañamiento preventivo en Cálculo y seguimiento de asistencia.")
                .modalidad("PRESENCIAL").estadoCita("PENDIENTE").build());

        convivenciaRepository.save(CasoConvivencia.builder()
                .radicado("CONV-2025-001").matricula(matSofia).reportadoPor(uCoord)
                .tipoSituacion("TIPO_I").severidad("LEVE")
                .descripcionSuceso("Mediación preventiva por llegada reiterada después del toque de campana en primera hora.")
                .medidaPedagogica("Diálogo reflexivo y acuerdo de puntualidad conforme al Manual de Convivencia (Ley 1620).")
                .estadoCaso("EN_SEGUIMIENTO").remitidoComite(false).build());

        resolucionRepository.save(ResolucionRectoral.builder()
                .numeroResolucion("RES-RECT-2025-001")
                .titulo("Adopción del Sistema Institucional de Evaluación de Estudiantes (SIEE - Decreto 1290)")
                .considerando("Que el Ministerio de Educación Nacional mediante el Decreto 1290 reglamenta la evaluación del aprendizaje y promoción de los estudiantes.")
                .resuelve("ARTÍCULO PRIMERO: Establecer la ponderación institucional en 40% Saber, 30% Hacer y 30% Ser en escala numérica de 1.0 a 5.0.")
                .emitidoPor(uRector).vigente(true).build());

        log.info("Catálogo institucional EduConnect inicializado exitosamente.");
    }
}
