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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

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

        usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("3030303031").email("coord.convivencia@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.COORDINADOR)
                .primerNombre("Luis").segundoNombre("Eduardo").primerApellido("Navarro").segundoApellido("Ríos")
                .telefono("3003334466").direccion("Coordinación de Convivencia Escolar").estado(true).build());

        Usuario uDirGrupo = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("4040404040").email("prof.silva@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DIRECTOR_GRUPO)
                .primerNombre("Roberto").segundoNombre("Arturo").primerApellido("Silva").segundoApellido("Pineda")
                .telefono("3104445566").direccion("Departamento de Matemáticas").estado(true).build());

        Usuario uDirMorales = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("4040404041").email("prof.morales@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DIRECTOR_GRUPO)
                .primerNombre("Lucía").segundoNombre("Fernanda").primerApellido("Morales").segundoApellido("Ortiz")
                .telefono("3104445577").direccion("Sección Primaria").estado(true).build());

        Usuario uDirCastro = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("4040404042").email("prof.castro@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DIRECTOR_GRUPO)
                .primerNombre("Andrés").segundoNombre("Felipe").primerApellido("Castro").segundoApellido("Mejía")
                .telefono("3104445588").direccion("Sección Primaria").estado(true).build());

        Usuario uDirRamirez = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("4040404043").email("prof.ramirez.d@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DIRECTOR_GRUPO)
                .primerNombre("Claudia").segundoNombre("Marcela").primerApellido("Ramírez").segundoApellido("Díaz")
                .telefono("3104445599").direccion("Departamento de Ciencias Naturales").estado(true).build());

        Usuario uDirHerrera = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("4040404044").email("prof.herrera@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DIRECTOR_GRUPO)
                .primerNombre("Diego").segundoNombre("Alejandro").primerApellido("Herrera").segundoApellido("Rojas")
                .telefono("3104445600").direccion("Departamento de Tecnología").estado(true).build());

        Usuario uDocente = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("5050505050").email("prof.gomez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DOCENTE)
                .primerNombre("Elena").segundoNombre("Marcela").primerApellido("Gómez").segundoApellido("Castro")
                .telefono("3115556677").direccion("Departamento de Ciencias Naturales").estado(true).build());

        Usuario uDocLopez = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("5050505051").email("prof.lopez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DOCENTE)
                .primerNombre("María").segundoNombre("Camila").primerApellido("López").segundoApellido("Torres")
                .telefono("3115556688").direccion("Departamento de Humanidades").estado(true).build());

        Usuario uDocTorres = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("5050505052").email("prof.torres@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DOCENTE)
                .primerNombre("Santiago").segundoNombre("Andrés").primerApellido("Torres").segundoApellido("Pardo")
                .telefono("3115556699").direccion("Departamento de Ciencias Sociales").estado(true).build());

        Usuario uDocSalazar = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("5050505053").email("prof.salazar@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.DOCENTE)
                .primerNombre("Valeria").segundoNombre("Sofía").primerApellido("Salazar").segundoApellido("León")
                .telefono("3115556700").direccion("Departamento de Idiomas").estado(true).build());

        Usuario uTutor = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789456").email("juan.ramirez@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Juan").segundoNombre("Fernando").primerApellido("Ramírez").segundoApellido("Ochoa")
                .telefono("3156667788").direccion("Cra 70 #45-12 Medellín").estado(true).build());

        Usuario uTutorLaura = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789457").email("laura.martinez@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Laura").segundoNombre("Patricia").primerApellido("Martínez").segundoApellido("Gómez")
                .telefono("3156667789").direccion("Calle 42 #18-24").estado(true).build());

        Usuario uTutorPedro = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789458").email("pedro.sanchez@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Pedro").segundoNombre("Antonio").primerApellido("Sánchez").segundoApellido("Ruiz")
                .telefono("3156667790").direccion("Av. El Poblado #12-30").estado(true).build());

        Usuario uTutorCarmen = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789459").email("carmen.rojas@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Carmen").segundoNombre("Rosa").primerApellido("Rojas").segundoApellido("Medina")
                .telefono("3156667791").direccion("Cra 48 #32-11").estado(true).build());

        Usuario uTutorJorge = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789460").email("jorge.diaz@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Jorge").segundoNombre("Enrique").primerApellido("Díaz").segundoApellido("Castro")
                .telefono("3156667792").direccion("Calle 60 #22-09").estado(true).build());

        Usuario uTutorMonica = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("CC").documento("71789461").email("monica.vega@gmail.com")
                .passwordHash(bcryptHash).rol(Rol.TUTOR)
                .primerNombre("Mónica").segundoNombre("Liliana").primerApellido("Vega").segundoApellido("Pardo")
                .telefono("3156667793").direccion("Diag. 74 #15-40").estado(true).build());

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

        Usuario uEstMateo = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("RC").documento("1010000101").email("mateo.martinez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Mateo").primerApellido("Martínez").segundoApellido("López")
                .telefono("3201000101").direccion("Calle 42 #18-24").estado(true).build());

        Usuario uEstLuciana = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000202").email("luciana.martinez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Luciana").primerApellido("Martínez").segundoApellido("López")
                .telefono("3201000202").direccion("Calle 42 #18-24").estado(true).build());

        Usuario uEstSamuel = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000303").email("samuel.sanchez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Samuel").primerApellido("Sánchez").segundoApellido("Pérez")
                .telefono("3201000303").direccion("Av. El Poblado #12-30").estado(true).build());

        Usuario uEstIsabella = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000404").email("isabella.sanchez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Isabella").primerApellido("Sánchez").segundoApellido("Pérez")
                .telefono("3201000404").direccion("Av. El Poblado #12-30").estado(true).build());

        Usuario uEstTomas = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000505").email("tomas.rojas@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Tomás").primerApellido("Rojas").segundoApellido("Medina")
                .telefono("3201000505").direccion("Cra 48 #32-11").estado(true).build());

        Usuario uEstValeria = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000606").email("valeria.rojas@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Valeria").primerApellido("Rojas").segundoApellido("Medina")
                .telefono("3201000606").direccion("Cra 48 #32-11").estado(true).build());

        Usuario uEstDaniel = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000707").email("daniel.diaz@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Daniel").primerApellido("Díaz").segundoApellido("Castro")
                .telefono("3201000707").direccion("Calle 60 #22-09").estado(true).build());

        Usuario uEstMariana = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000808").email("mariana.diaz@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Mariana").primerApellido("Díaz").segundoApellido("Castro")
                .telefono("3201000808").direccion("Calle 60 #22-09").estado(true).build());

        Usuario uEstSebastian = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010000909").email("sebastian.vega@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Sebastián").primerApellido("Vega").segundoApellido("Pardo")
                .telefono("3201000909").direccion("Diag. 74 #15-40").estado(true).build());

        Usuario uEstCamila = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010001010").email("camila.vega@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Camila").primerApellido("Vega").segundoApellido("Pardo")
                .telefono("3201001010").direccion("Diag. 74 #15-40").estado(true).build());

        Usuario uEstAlejandro = usuarioRepository.save(Usuario.builder()
                .tipoDocumento("TI").documento("1010001111").email("alejandro.ramirez@educonnect.com")
                .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                .primerNombre("Alejandro").primerApellido("Ramírez").segundoApellido("Gómez")
                .telefono("3201001111").direccion("Cra 70 #45-12").estado(true).build());

        // 2. DOCENTES (Con usuario_id correctamente vinculado)
        Docente docSilva = docenteRepository.save(Docente.builder()
                .usuario(uDirGrupo).codigoEmpleado("DOC-2025-001")
                .especialidad("Matemáticas y Cálculo").tituloProfesional("Magíster en Enseñanza de las Ciencias Exactas")
                .escalafon("Grado 3A").fechaVinculacion(LocalDate.of(2019, 2, 1)).activo(true).build());

        Docente docGomez = docenteRepository.save(Docente.builder()
                .usuario(uDocente).codigoEmpleado("DOC-2025-002")
                .especialidad("Física y Química").tituloProfesional("Licenciada en Física y Ciencias Naturales")
                .escalafon("Grado 2B").fechaVinculacion(LocalDate.of(2021, 1, 18)).activo(true).build());

        Docente docMorales = docenteRepository.save(Docente.builder()
                .usuario(uDirMorales).codigoEmpleado("DOC-2025-003")
                .especialidad("Pedagogía Infantil y Matemáticas Básicas").tituloProfesional("Licenciada en Educación Básica Primaria")
                .escalafon("Grado 2A").fechaVinculacion(LocalDate.of(2020, 2, 1)).activo(true).build());

        Docente docCastro = docenteRepository.save(Docente.builder()
                .usuario(uDirCastro).codigoEmpleado("DOC-2025-004")
                .especialidad("Matemáticas y Geometría").tituloProfesional("Licenciado en Educación Básica con Énfasis en Matemáticas")
                .escalafon("Grado 2B").fechaVinculacion(LocalDate.of(2020, 7, 15)).activo(true).build());

        Docente docRamirez = docenteRepository.save(Docente.builder()
                .usuario(uDirRamirez).codigoEmpleado("DOC-2025-005")
                .especialidad("Biología y Ciencias Naturales").tituloProfesional("Bióloga y Especialista en Educación Ambiental")
                .escalafon("Grado 3A").fechaVinculacion(LocalDate.of(2018, 1, 22)).activo(true).build());

        Docente docHerrera = docenteRepository.save(Docente.builder()
                .usuario(uDirHerrera).codigoEmpleado("DOC-2025-006")
                .especialidad("Tecnología e Informática Escolar").tituloProfesional("Licenciado en Tecnología e Informática")
                .escalafon("Grado 2B").fechaVinculacion(LocalDate.of(2022, 1, 24)).activo(true).build());

        Docente docLopez = docenteRepository.save(Docente.builder()
                .usuario(uDocLopez).codigoEmpleado("DOC-2025-007")
                .especialidad("Lengua Castellana y Lectura Crítica").tituloProfesional("Licenciada en Español y Literatura")
                .escalafon("Grado 2A").fechaVinculacion(LocalDate.of(2021, 2, 1)).activo(true).build());

        Docente docTorres = docenteRepository.save(Docente.builder()
                .usuario(uDocTorres).codigoEmpleado("DOC-2025-008")
                .especialidad("Ciencias Sociales, Historia y Constitución").tituloProfesional("Licenciado en Ciencias Sociales")
                .escalafon("Grado 2A").fechaVinculacion(LocalDate.of(2021, 7, 19)).activo(true).build());

        Docente docSalazar = docenteRepository.save(Docente.builder()
                .usuario(uDocSalazar).codigoEmpleado("DOC-2025-009")
                .especialidad("Inglés y Bilingüismo").tituloProfesional("Licenciada en Lenguas Extranjeras")
                .escalafon("Grado 2B").fechaVinculacion(LocalDate.of(2023, 1, 23)).activo(true).build());

        // Docentes adicionales para contar con 3 docentes por asignatura
        Object[][] extraDocentesData = {
                {"Julián", "Medina", "5050505054", "prof.medina@educonnect.com", "DOC-2025-010", "Matemáticas y Cálculo", "Licenciado en Matemáticas"},
                {"Paola", "Vargas", "5050505055", "prof.vargas@educonnect.com", "DOC-2025-011", "Física y Ciencias Naturales", "Licenciada en Física"},
                {"Óscar", "Quintero", "5050505056", "prof.quintero@educonnect.com", "DOC-2025-012", "Física y Química", "Licenciado en Ciencias Naturales"},
                {"Diana", "Cárdenas", "5050505057", "prof.cardenas@educonnect.com", "DOC-2025-013", "Química y Biología", "Licenciada en Biología y Química"},
                {"Felipe", "Rincón", "5050505058", "prof.rincon@educonnect.com", "DOC-2025-014", "Tecnología e Informática", "Licenciado en Tecnología e Informática"},
                {"Natalia", "Becerra", "5050505059", "prof.becerra@educonnect.com", "DOC-2025-015", "Tecnología e Inglés", "Licenciada en Educación e Informática"},
                {"Héctor", "Pacheco", "5050505060", "prof.pacheco@educonnect.com", "DOC-2025-016", "Lengua Castellana y Sociales", "Licenciado en Humanidades"},
                {"Adriana", "Molina", "5050505061", "prof.molina@educonnect.com", "DOC-2025-017", "Ciencias Sociales e Historia", "Licenciada en Ciencias Sociales"},
                {"Esteban", "Guerrero", "5050505062", "prof.guerrero@educonnect.com", "DOC-2025-018", "Inglés Comunicativo", "Licenciado en Lenguas Modernas"}
        };
        List<Docente> extraDocentes = new ArrayList<>();
        for (Object[] d : extraDocentesData) {
            Usuario uExtraDoc = usuarioRepository.save(Usuario.builder()
                    .tipoDocumento("CC").documento((String) d[2]).email((String) d[3])
                    .passwordHash(bcryptHash).rol(Rol.DOCENTE)
                    .primerNombre((String) d[0]).primerApellido((String) d[1])
                    .telefono("312" + ((String) d[2]).substring(3)).direccion("Sala de Docentes").estado(true).build());
            extraDocentes.add(docenteRepository.save(Docente.builder()
                    .usuario(uExtraDoc).codigoEmpleado((String) d[4])
                    .especialidad((String) d[5]).tituloProfesional((String) d[6])
                    .escalafon("Grado 2A").fechaVinculacion(LocalDate.of(2022, 2, 1)).activo(true).build()));
        }
        Docente docMedina = extraDocentes.get(0);
        Docente docVargas = extraDocentes.get(1);
        Docente docQuintero = extraDocentes.get(2);
        Docente docCardenas = extraDocentes.get(3);
        Docente docRincon = extraDocentes.get(4);
        Docente docBecerra = extraDocentes.get(5);
        Docente docPacheco = extraDocentes.get(6);
        Docente docMolina = extraDocentes.get(7);
        Docente docGuerrero = extraDocentes.get(8);

        // 3. TUTORES Y ESTUDIANTES (Con usuario_id correctamente vinculado)
        Tutor tutorJuan = tutorRepository.save(Tutor.builder()
                .usuario(uTutor).ocupacion("Ingeniero Civil").empresaTrabajo("Constructora Antioquia S.A.")
                .telefonoEmergencia("3156667788").correoAlternativo("jframirez@constructora.co").autorizadoRecoger(true).build());

        Tutor tutorLaura = tutorRepository.save(Tutor.builder()
                .usuario(uTutorLaura).ocupacion("Contadora Pública").empresaTrabajo("Asesorías del Norte")
                .telefonoEmergencia("3156667789").autorizadoRecoger(true).build());

        Tutor tutorPedro = tutorRepository.save(Tutor.builder()
                .usuario(uTutorPedro).ocupacion("Comerciante").empresaTrabajo("Distribuidora Central")
                .telefonoEmergencia("3156667790").autorizadoRecoger(true).build());

        Tutor tutorCarmen = tutorRepository.save(Tutor.builder()
                .usuario(uTutorCarmen).ocupacion("Enfermera Jefe").empresaTrabajo("Clínica Universitaria")
                .telefonoEmergencia("3156667791").autorizadoRecoger(true).build());

        Tutor tutorJorge = tutorRepository.save(Tutor.builder()
                .usuario(uTutorJorge).ocupacion("Arquitecto").empresaTrabajo("Estudio Hábitat")
                .telefonoEmergencia("3156667792").autorizadoRecoger(true).build());

        Tutor tutorMonica = tutorRepository.save(Tutor.builder()
                .usuario(uTutorMonica).ocupacion("Abogada").empresaTrabajo("Bufete Vega & Asociados")
                .telefonoEmergencia("3156667793").autorizadoRecoger(true).build());

        Estudiante estCarlos = estudianteRepository.save(Estudiante.builder()
                .usuario(uEstCarlos).codigoEstudiantil("EST-2025-1001")
                .fechaNacimiento(LocalDate.of(2009, 4, 14)).genero("M").rhGrupoSanguineo("O+")
                .eps("Sura EPS").estrato(3).estadoAcademico("ACTIVO").build());

        Estudiante estSofia = estudianteRepository.save(Estudiante.builder()
                .usuario(uEstSofia).codigoEstudiantil("EST-2025-1002")
                .fechaNacimiento(LocalDate.of(2009, 8, 22)).genero("F").rhGrupoSanguineo("A+")
                .eps("Sanitas EPS").estrato(4).estadoAcademico("ACTIVO").build());

        Estudiante estMateo = estudianteRepository.save(Estudiante.builder().usuario(uEstMateo).codigoEstudiantil("EST-2025-0101").fechaNacimiento(LocalDate.of(2018, 3, 10)).genero("M").rhGrupoSanguineo("O+").eps("Sura EPS").estrato(3).estadoAcademico("ACTIVO").build());
        Estudiante estLuciana = estudianteRepository.save(Estudiante.builder().usuario(uEstLuciana).codigoEstudiantil("EST-2025-0201").fechaNacimiento(LocalDate.of(2017, 5, 19)).genero("F").rhGrupoSanguineo("O+").eps("Sura EPS").estrato(3).estadoAcademico("ACTIVO").build());
        Estudiante estSamuel = estudianteRepository.save(Estudiante.builder().usuario(uEstSamuel).codigoEstudiantil("EST-2025-0301").fechaNacimiento(LocalDate.of(2016, 2, 11)).genero("M").rhGrupoSanguineo("A+").eps("Salud Total").estrato(3).estadoAcademico("ACTIVO").build());
        Estudiante estIsabella = estudianteRepository.save(Estudiante.builder().usuario(uEstIsabella).codigoEstudiantil("EST-2025-0401").fechaNacimiento(LocalDate.of(2015, 9, 3)).genero("F").rhGrupoSanguineo("A+").eps("Salud Total").estrato(3).estadoAcademico("ACTIVO").build());
        Estudiante estTomas = estudianteRepository.save(Estudiante.builder().usuario(uEstTomas).codigoEstudiantil("EST-2025-0501").fechaNacimiento(LocalDate.of(2014, 1, 28)).genero("M").rhGrupoSanguineo("B+").eps("Nueva EPS").estrato(3).estadoAcademico("ACTIVO").build());
        Estudiante estValeria = estudianteRepository.save(Estudiante.builder().usuario(uEstValeria).codigoEstudiantil("EST-2025-0601").fechaNacimiento(LocalDate.of(2013, 6, 15)).genero("F").rhGrupoSanguineo("B+").eps("Nueva EPS").estrato(3).estadoAcademico("ACTIVO").build());
        Estudiante estDaniel = estudianteRepository.save(Estudiante.builder().usuario(uEstDaniel).codigoEstudiantil("EST-2025-0701").fechaNacimiento(LocalDate.of(2012, 11, 7)).genero("M").rhGrupoSanguineo("O-").eps("Sanitas EPS").estrato(4).estadoAcademico("ACTIVO").build());
        Estudiante estMariana = estudianteRepository.save(Estudiante.builder().usuario(uEstMariana).codigoEstudiantil("EST-2025-0801").fechaNacimiento(LocalDate.of(2011, 4, 25)).genero("F").rhGrupoSanguineo("O-").eps("Sanitas EPS").estrato(4).estadoAcademico("ACTIVO").build());
        Estudiante estSebastian = estudianteRepository.save(Estudiante.builder().usuario(uEstSebastian).codigoEstudiantil("EST-2025-0901").fechaNacimiento(LocalDate.of(2010, 10, 12)).genero("M").rhGrupoSanguineo("AB+").eps("Sura EPS").estrato(4).estadoAcademico("ACTIVO").build());
        Estudiante estCamila = estudianteRepository.save(Estudiante.builder().usuario(uEstCamila).codigoEstudiantil("EST-2025-1003").fechaNacimiento(LocalDate.of(2009, 7, 30)).genero("F").rhGrupoSanguineo("AB+").eps("Sura EPS").estrato(4).estadoAcademico("ACTIVO").build());
        Estudiante estAlejandro = estudianteRepository.save(Estudiante.builder().usuario(uEstAlejandro).codigoEstudiantil("EST-2025-1101").fechaNacimiento(LocalDate.of(2008, 12, 5)).genero("M").rhGrupoSanguineo("A+").eps("Sanitas EPS").estrato(4).estadoAcademico("ACTIVO").build());

        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estCarlos).tutor(tutorJuan).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estSofia).tutor(tutorJuan).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estAlejandro).tutor(tutorJuan).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estMateo).tutor(tutorLaura).parentesco("MADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estLuciana).tutor(tutorLaura).parentesco("MADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estSamuel).tutor(tutorPedro).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estIsabella).tutor(tutorPedro).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estTomas).tutor(tutorCarmen).parentesco("MADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estValeria).tutor(tutorCarmen).parentesco("MADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estDaniel).tutor(tutorJorge).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estMariana).tutor(tutorJorge).parentesco("PADRE").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estSebastian).tutor(tutorMonica).parentesco("ACUDIENTE_LEGAL").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
        estudianteTutorRepository.save(EstudianteTutor.builder().estudiante(estCamila).tutor(tutorMonica).parentesco("ACUDIENTE_LEGAL").esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());

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

        // 5. GRADOS (1° a 11°), MATERIAS, GRUPOS Y CARGAS ACADÉMICAS
        Grado g1 = gradoRepository.save(Grado.builder().nombre("Primero (1°)").nivel("PRIMARIA").numeroOrden(1).build());
        Grado g2 = gradoRepository.save(Grado.builder().nombre("Segundo (2°)").nivel("PRIMARIA").numeroOrden(2).build());
        Grado g3 = gradoRepository.save(Grado.builder().nombre("Tercero (3°)").nivel("PRIMARIA").numeroOrden(3).build());
        Grado g4 = gradoRepository.save(Grado.builder().nombre("Cuarto (4°)").nivel("PRIMARIA").numeroOrden(4).build());
        Grado g5 = gradoRepository.save(Grado.builder().nombre("Quinto (5°)").nivel("PRIMARIA").numeroOrden(5).build());
        Grado g6 = gradoRepository.save(Grado.builder().nombre("Sexto (6°)").nivel("SECUNDARIA").numeroOrden(6).build());
        Grado g7 = gradoRepository.save(Grado.builder().nombre("Séptimo (7°)").nivel("SECUNDARIA").numeroOrden(7).build());
        Grado g8 = gradoRepository.save(Grado.builder().nombre("Octavo (8°)").nivel("SECUNDARIA").numeroOrden(8).build());
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
                .codigoOficial("INF-10").nombre("Tecnología e Informática").areaConocimiento("Tecnología e Informática")
                .horasSemanales(3).descripcion("Ofimática, pensamiento computacional y ciudadanía digital").activa(true).build());
        Materia matMatBas = materiaRepository.save(Materia.builder()
                .codigoOficial("MAT-BAS").nombre("Matemáticas Fundamentales").areaConocimiento("Matemáticas")
                .horasSemanales(5).descripcion("Aritmética, álgebra básica y geometría escolar").activa(true).build());
        Materia matEspanol = materiaRepository.save(Materia.builder()
                .codigoOficial("ESP-LIT").nombre("Lengua Castellana y Lectura Crítica").areaConocimiento("Humanidades")
                .horasSemanales(4).descripcion("Comprensión lectora, producción textual y literatura").activa(true).build());
        Materia matNaturales = materiaRepository.save(Materia.builder()
                .codigoOficial("NAT-BIO").nombre("Ciencias Naturales y Biología").areaConocimiento("Ciencias Naturales")
                .horasSemanales(4).descripcion("Ecosistemas, biología celular y método científico").activa(true).build());
        Materia matSociales = materiaRepository.save(Materia.builder()
                .codigoOficial("SOC-HIS").nombre("Ciencias Sociales e Historia").areaConocimiento("Ciencias Sociales")
                .horasSemanales(3).descripcion("Historia de Colombia, geografía y competencias ciudadanas").activa(true).build());
        Materia matIngles = materiaRepository.save(Materia.builder()
                .codigoOficial("ING-BIL").nombre("Inglés Comunicativo").areaConocimiento("Idiomas")
                .horasSemanales(3).descripcion("Comprensión auditiva, lectura y conversación en inglés").activa(true).build());

        Grupo grupo1A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g1).codigoGrupo("1-A").directorGrupo(docMorales).salonAula("Aula 101 - Primaria").jornada("MAÑANA").cupoMaximo(30).build());
        Grupo grupo2A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g2).codigoGrupo("2-A").directorGrupo(docMorales).salonAula("Aula 102 - Primaria").jornada("MAÑANA").cupoMaximo(30).build());
        Grupo grupo3A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g3).codigoGrupo("3-A").directorGrupo(docCastro).salonAula("Aula 103 - Primaria").jornada("MAÑANA").cupoMaximo(32).build());
        Grupo grupo4A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g4).codigoGrupo("4-A").directorGrupo(docCastro).salonAula("Aula 104 - Primaria").jornada("MAÑANA").cupoMaximo(32).build());
        Grupo grupo5A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g5).codigoGrupo("5-A").directorGrupo(docTorres).salonAula("Aula 105 - Primaria").jornada("MAÑANA").cupoMaximo(32).build());
        Grupo grupo6A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g6).codigoGrupo("6-A").directorGrupo(docRamirez).salonAula("Aula 203 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo7A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g7).codigoGrupo("7-A").directorGrupo(docLopez).salonAula("Aula 204 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo8A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g8).codigoGrupo("8-A").directorGrupo(docSalazar).salonAula("Aula 205 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo9A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g9).codigoGrupo("9-A").directorGrupo(docRamirez).salonAula("Aula 206 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo10A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g10).codigoGrupo("10-A").directorGrupo(docSilva).salonAula("Aula 201 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo10B = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g10).codigoGrupo("10-B").directorGrupo(docGomez).salonAula("Aula 202 - Bloque B").jornada("MAÑANA").cupoMaximo(35).build());
        Grupo grupo11A = grupoRepository.save(Grupo.builder().anioLectivo(anio2025).grado(g11).codigoGrupo("11-A").directorGrupo(docHerrera).salonAula("Aula 301 - Bloque C").jornada("MAÑANA").cupoMaximo(35).build());

        CargaAcademica cargaCalc10A = cargaRepository.save(CargaAcademica.builder().grupo(grupo10A).materia(matCalculo).docente(docSilva).intensidadHoraria(5).build());
        CargaAcademica cargaFis10A = cargaRepository.save(CargaAcademica.builder().grupo(grupo10A).materia(matFisica).docente(docGomez).intensidadHoraria(4).build());
        CargaAcademica cargaQui10A = cargaRepository.save(CargaAcademica.builder().grupo(grupo10A).materia(matQuimica).docente(docGomez).intensidadHoraria(4).build());
        CargaAcademica cargaSoft10A = cargaRepository.save(CargaAcademica.builder().grupo(grupo10A).materia(matSoftware).docente(docSilva).intensidadHoraria(3).build());

        // Cargas adicionales de 1° a 11° (3 docentes distintos por cada asignatura)
        cargaRepository.save(CargaAcademica.builder().grupo(grupo1A).materia(matMatBas).docente(docMorales).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo1A).materia(matEspanol).docente(docLopez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo2A).materia(matMatBas).docente(docMorales).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo2A).materia(matEspanol).docente(docMorales).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo2A).materia(matIngles).docente(docSalazar).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo3A).materia(matMatBas).docente(docCastro).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo3A).materia(matEspanol).docente(docPacheco).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo3A).materia(matNaturales).docente(docRamirez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo4A).materia(matMatBas).docente(docCastro).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo4A).materia(matSociales).docente(docTorres).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo4A).materia(matNaturales).docente(docCardenas).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo4A).materia(matIngles).docente(docGuerrero).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo5A).materia(matMatBas).docente(docMedina).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo5A).materia(matSociales).docente(docTorres).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo5A).materia(matEspanol).docente(docLopez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo5A).materia(matNaturales).docente(docCardenas).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo5A).materia(matIngles).docente(docBecerra).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo6A).materia(matNaturales).docente(docRamirez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo6A).materia(matMatBas).docente(docCastro).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo6A).materia(matEspanol).docente(docPacheco).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo6A).materia(matSociales).docente(docMolina).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo6A).materia(matIngles).docente(docGuerrero).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo7A).materia(matMatBas).docente(docMedina).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo7A).materia(matEspanol).docente(docLopez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo7A).materia(matNaturales).docente(docVargas).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo7A).materia(matSociales).docente(docMolina).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo7A).materia(matIngles).docente(docSalazar).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo7A).materia(matSoftware).docente(docRincon).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo8A).materia(matIngles).docente(docSalazar).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo8A).materia(matSociales).docente(docTorres).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo8A).materia(matSoftware).docente(docBecerra).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo9A).materia(matNaturales).docente(docRamirez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo9A).materia(matSoftware).docente(docHerrera).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo9A).materia(matCalculo).docente(docMedina).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo9A).materia(matFisica).docente(docQuintero).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo9A).materia(matQuimica).docente(docCardenas).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo9A).materia(matSociales).docente(docPacheco).intensidadHoraria(3).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo10B).materia(matCalculo).docente(docCastro).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo10B).materia(matFisica).docente(docGomez).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo10B).materia(matQuimica).docente(docQuintero).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo11A).materia(matSoftware).docente(docHerrera).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo11A).materia(matCalculo).docente(docSilva).intensidadHoraria(5).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo11A).materia(matFisica).docente(docVargas).intensidadHoraria(4).build());
        cargaRepository.save(CargaAcademica.builder().grupo(grupo11A).materia(matQuimica).docente(docGomez).intensidadHoraria(4).build());

        // 6. MATRÍCULAS Y CALIFICACIONES DECRETO 1290
        Matricula matCarlos = matriculaRepository.save(Matricula.builder()
                .folioMatricula("MAT-2025-1001").estudiante(estCarlos).grupo(grupo10A).anioLectivo(anio2025)
                .pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());

        Matricula matSofia = matriculaRepository.save(Matricula.builder()
                .folioMatricula("MAT-2025-1002").estudiante(estSofia).grupo(grupo10A).anioLectivo(anio2025)
                .pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());

        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0101").estudiante(estMateo).grupo(grupo1A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0201").estudiante(estLuciana).grupo(grupo2A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0301").estudiante(estSamuel).grupo(grupo3A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0401").estudiante(estIsabella).grupo(grupo4A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0501").estudiante(estTomas).grupo(grupo5A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0601").estudiante(estValeria).grupo(grupo6A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0701").estudiante(estDaniel).grupo(grupo7A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0801").estudiante(estMariana).grupo(grupo8A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-0901").estudiante(estSebastian).grupo(grupo9A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-1003").estudiante(estCamila).grupo(grupo10B).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
        matriculaRepository.save(Matricula.builder().folioMatricula("MAT-2025-1101").estudiante(estAlejandro).grupo(grupo11A).anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());

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
                .juicioValorativo("Destacado desempeño en herramientas digitales y pensamiento computacional.")
                .modificadoPor(uDirGrupo).build());

        calificacionRepository.save(Calificacion.builder()
                .matricula(matSofia).cargaAcademica(cargaCalc10A).periodo(p1)
                .notaCognitiva(new BigDecimal("2.8")).notaProcedimental(new BigDecimal("2.9")).notaActitudinal(new BigDecimal("3.2"))
                .notaDefinitivaPeriodo(new BigDecimal("3.0")).escalaDesempeno("BASICO")
                .juicioValorativo("Supera los logros básicos; se sugiere refuerzo en resolución de ecuaciones.")
                .modificadoPor(uDirGrupo).build());

        // Segundo estudiante por cada grupo (1-A a 11-A y 10-B) para poblar todas las aulas
        Object[][] extraEstudiantes = {
                {"Paula", "Jiménez", "1010000102", "paula.jimenez@educonnect.com", "EST-2025-0102", "F", grupo1A, tutorLaura, "MADRE"},
                {"Nicolás", "Gómez", "1010000203", "nicolas.gomez@educonnect.com", "EST-2025-0202", "M", grupo2A, tutorLaura, "MADRE"},
                {"Emiliana", "Ruiz", "1010000304", "emiliana.ruiz@educonnect.com", "EST-2025-0302", "F", grupo3A, tutorPedro, "PADRE"},
                {"Jerónimo", "Castro", "1010000405", "jeronimo.castro@educonnect.com", "EST-2025-0402", "M", grupo4A, tutorPedro, "PADRE"},
                {"Salomé", "Pardo", "1010000506", "salome.pardo@educonnect.com", "EST-2025-0502", "F", grupo5A, tutorCarmen, "MADRE"},
                {"Martín", "León", "1010000607", "martin.leon@educonnect.com", "EST-2025-0602", "M", grupo6A, tutorCarmen, "MADRE"},
                {"Gabriela", "Ortiz", "1010000708", "gabriela.ortiz@educonnect.com", "EST-2025-0702", "F", grupo7A, tutorJorge, "PADRE"},
                {"Esteban", "Mejía", "1010000809", "esteban.mejia@educonnect.com", "EST-2025-0802", "M", grupo8A, tutorJorge, "PADRE"},
                {"Antonia", "Navarro", "1010000910", "antonia.navarro@educonnect.com", "EST-2025-0902", "F", grupo9A, tutorMonica, "ACUDIENTE_LEGAL"},
                {"Miguel", "Torres", "1010001011", "miguel.torres@educonnect.com", "EST-2025-1004", "M", grupo10B, tutorMonica, "ACUDIENTE_LEGAL"},
                {"Juliana", "Mendoza", "1010001112", "juliana.mendoza@educonnect.com", "EST-2025-1102", "F", grupo11A, tutorJuan, "PADRE"}
        };
        int folioIdx = 2;
        for (Object[] row : extraEstudiantes) {
            Usuario uExtra = usuarioRepository.save(Usuario.builder()
                    .tipoDocumento("TI").documento((String) row[2]).email((String) row[3])
                    .passwordHash(bcryptHash).rol(Rol.ESTUDIANTE)
                    .primerNombre((String) row[0]).primerApellido((String) row[1])
                    .telefono("32099900" + String.format("%02d", folioIdx))
                    .direccion("Sede Institucional").estado(true).build());
            Estudiante estExtra = estudianteRepository.save(Estudiante.builder()
                    .usuario(uExtra).codigoEstudiantil((String) row[4])
                    .fechaNacimiento(LocalDate.of(2012, 5, 15)).genero((String) row[5])
                    .rhGrupoSanguineo("O+").eps("Sura EPS").estrato(3).estadoAcademico("ACTIVO").build());
            estudianteTutorRepository.save(EstudianteTutor.builder()
                    .estudiante(estExtra).tutor((Tutor) row[7]).parentesco((String) row[8])
                    .esAcudientePrincipal(true).viveConEstudiante(true).responsableEconomico(true).build());
            matriculaRepository.save(Matricula.builder()
                    .folioMatricula("MAT-2025-EX-" + folioIdx).estudiante(estExtra).grupo((Grupo) row[6])
                    .anioLectivo(anio2025).pazYSalvo(true).esRepitente(false).estadoMatricula("ACTIVA").build());
            folioIdx++;
        }

        // Subir calificaciones Decreto 1290 a TODOS los estudiantes en todas sus materias del grupo
        List<Matricula> todasMatriculas = matriculaRepository.findAll();
        List<CargaAcademica> todasCargas = cargaRepository.findAll();
        BigDecimal[][] muestrasNotas = {
                {new BigDecimal("4.6"), new BigDecimal("4.5"), new BigDecimal("4.8")},
                {new BigDecimal("4.1"), new BigDecimal("4.2"), new BigDecimal("4.3")},
                {new BigDecimal("3.6"), new BigDecimal("3.8"), new BigDecimal("4.0")},
                {new BigDecimal("4.4"), new BigDecimal("4.3"), new BigDecimal("4.5")},
                {new BigDecimal("3.3"), new BigDecimal("3.5"), new BigDecimal("3.7")},
                {new BigDecimal("4.7"), new BigDecimal("4.8"), new BigDecimal("4.9")}
        };
        int notaSeedIdx = 0;
        for (Matricula mat : todasMatriculas) {
            for (CargaAcademica carga : todasCargas) {
                if (carga.getGrupo() == null || mat.getGrupo() == null
                        || !carga.getGrupo().getId().equals(mat.getGrupo().getId())) {
                    continue;
                }
                if (calificacionRepository.findByMatricula_IdAndCargaAcademica_IdAndPeriodo_Id(
                        mat.getId(), carga.getId(), p1.getId()).isPresent()) {
                    continue;
                }
                BigDecimal[] par = muestrasNotas[notaSeedIdx % muestrasNotas.length];
                notaSeedIdx++;
                BigDecimal def = par[0].multiply(new BigDecimal("0.40"))
                        .add(par[1].multiply(new BigDecimal("0.30")))
                        .add(par[2].multiply(new BigDecimal("0.30")))
                        .setScale(1, RoundingMode.HALF_UP);
                String esc = def.compareTo(new BigDecimal("4.6")) >= 0 ? "SUPERIOR"
                        : def.compareTo(new BigDecimal("4.0")) >= 0 ? "ALTO"
                        : def.compareTo(new BigDecimal("3.0")) >= 0 ? "BASICO" : "BAJO";
                calificacionRepository.save(Calificacion.builder()
                        .matricula(mat).cargaAcademica(carga).periodo(p1)
                        .notaCognitiva(par[0]).notaProcedimental(par[1]).notaActitudinal(par[2])
                        .notaDefinitivaPeriodo(def).escalaDesempeno(esc)
                        .juicioValorativo("Desempeño " + esc.toLowerCase() + " en " + carga.getMateria().getNombre() + ".")
                        .modificadoPor(carga.getDocente() != null ? carga.getDocente().getUsuario() : uDirGrupo)
                        .build());
            }
        }

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

        // Horarios escolares garantizados sin colisiones para todas las cargas académicas (1° a 11°)
        Set<String> slotsOcupados = new HashSet<>();
        for (HorarioEscolar h : horarioRepository.findAll()) {
            slotsOcupados.add("G:" + h.getGrupo().getId() + ":" + h.getDiaSemana() + ":" + h.getBloqueOrden());
            if (h.getDocente() != null) {
                slotsOcupados.add("D:" + h.getDocente().getId() + ":" + h.getDiaSemana() + ":" + h.getBloqueOrden());
            }
        }
        // Reservar VIERNES bloque 5 (11:30-12:30) para grupo 10-A y docSilva (usado en prueba de colisiones)
        slotsOcupados.add("G:" + grupo10A.getId() + ":VIERNES:5");
        slotsOcupados.add("D:" + docSilva.getId() + ":VIERNES:5");

        String[] diasSemana = {"LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"};
        LocalTime[][] bloquesHoras = {
                {LocalTime.of(7, 0), LocalTime.of(8, 0)},
                {LocalTime.of(8, 0), LocalTime.of(9, 0)},
                {LocalTime.of(9, 30), LocalTime.of(10, 30)},
                {LocalTime.of(10, 30), LocalTime.of(11, 30)},
                {LocalTime.of(11, 30), LocalTime.of(12, 30)}
        };

        for (CargaAcademica carga : todasCargas) {
            if (carga.getGrupo() == null || carga.getDocente() == null) continue;
            boolean yaTiene = horarioRepository.findAll().stream().anyMatch(h ->
                    h.getGrupo().getId().equals(carga.getGrupo().getId())
                            && h.getMateria().getId().equals(carga.getMateria().getId()));
            if (yaTiene) continue;

            boolean asignado = false;
            for (String dia : diasSemana) {
                for (int b = 1; b <= bloquesHoras.length; b++) {
                    String gKey = "G:" + carga.getGrupo().getId() + ":" + dia + ":" + b;
                    String dKey = "D:" + carga.getDocente().getId() + ":" + dia + ":" + b;
                    if (!slotsOcupados.contains(gKey) && !slotsOcupados.contains(dKey)) {
                        slotsOcupados.add(gKey);
                        slotsOcupados.add(dKey);
                        horarioRepository.save(HorarioEscolar.builder()
                                .anioLectivo(anio2025)
                                .grupo(carga.getGrupo())
                                .materia(carga.getMateria())
                                .docente(carga.getDocente())
                                .diaSemana(dia)
                                .bloqueOrden(b)
                                .horaInicio(bloquesHoras[b - 1][0])
                                .horaFin(bloquesHoras[b - 1][1])
                                .aula(carga.getGrupo().getSalonAula() != null ? carga.getGrupo().getSalonAula() : "Aula Institucional")
                                .build());
                        asignado = true;
                        break;
                    }
                }
                if (asignado) break;
            }
        }

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
