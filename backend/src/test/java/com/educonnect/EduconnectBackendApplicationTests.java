package com.educonnect;

import com.educonnect.model.CargaAcademica;
import com.educonnect.model.CodigoRecuperacion;
import com.educonnect.model.Estudiante;
import com.educonnect.model.PeriodoAcademico;
import com.educonnect.repository.CargaAcademicaRepository;
import com.educonnect.repository.AsistenciaRepository;
import com.educonnect.repository.MatriculaRepository;
import com.educonnect.repository.UsuarioRepository;
import com.educonnect.repository.CodigoRecuperacionRepository;
import com.educonnect.repository.EstudianteRepository;
import com.educonnect.repository.PeriodoAcademicoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class EduconnectBackendApplicationTests {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private EstudianteRepository estudianteRepository;

    @Autowired
    private CargaAcademicaRepository cargaAcademicaRepository;

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private MatriculaRepository matriculaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Autowired
    private CodigoRecuperacionRepository codigoRecuperacionRepository;

    private static final String TEST_SEED_PASS = "123456";

    @Test
    void filtersTargetedAnnouncementsInTheDirectoryAndEduBot() throws Exception {
        String coord = "Bearer " + loginAndGetToken("coordinador@educonnect.com", TEST_SEED_PASS);
        String tutor = "Bearer " + loginAndGetToken("juan.ramirez@gmail.com", TEST_SEED_PASS);
        String student = "Bearer " + loginAndGetToken("carlosvargas@educonnect.com", TEST_SEED_PASS);
        String titulo = "Circular reservada para acudientes";
        mockMvc.perform(post("/api/v1/comunicados").header("Authorization", coord)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "titulo", titulo, "contenido", "Información de prueba", "destinatarioRol", "TUTORES"))))
                .andExpect(status().isCreated());
        var asTutor = mockMvc.perform(get("/api/v1/comunicados").header("Authorization", tutor))
                .andExpect(status().isOk()).andReturn();
        var asStudent = mockMvc.perform(get("/api/v1/comunicados").header("Authorization", student))
                .andExpect(status().isOk()).andReturn();
        assertThat(objectMapper.readTree(asTutor.getResponse().getContentAsString()).findValuesAsText("titulo")).contains(titulo);
        assertThat(objectMapper.readTree(asStudent.getResponse().getContentAsString()).findValuesAsText("titulo")).doesNotContain(titulo);
        var chat = mockMvc.perform(post("/api/v1/edubot/consulta").header("Authorization", student)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"pregunta\":\"Última circular\"}"))
                .andExpect(status().isOk()).andReturn();
        assertThat(objectMapper.readTree(chat.getResponse().getContentAsString()).get("respuesta").asText())
                .doesNotContain(titulo);
    }

    @Test
    void academicAssignmentAcceptsTeacherUserIdFromTheAdminForm() throws Exception {
        String token = "Bearer " + loginAndGetToken("admin@educonnect.com", TEST_SEED_PASS);
        var carga = cargaAcademicaRepository.findAll().getFirst();
        var creada = mockMvc.perform(post("/api/v1/admin/materias").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"codigo\":\"AUD-CARGA\",\"nombre\":\"Didáctica de prueba\"}"))
                .andExpect(status().isCreated()).andReturn();
        long materiaId = objectMapper.readTree(creada.getResponse().getContentAsString()).get("id").asLong();
        var entrada = Map.of("grupoId", carga.getGrupo().getId(), "materiaId", materiaId,
                "docenteUsuarioId", carga.getDocente().getUsuario().getId(), "intensidadHoraria", 3);
        mockMvc.perform(post("/api/v1/admin/cargas").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(entrada)))
                .andExpect(status().isCreated());
        assertThat(cargaAcademicaRepository.findByGrupo_IdAndMateria_Id(carga.getGrupo().getId(), materiaId))
                .hasValueSatisfying(saved -> assertThat(saved.getDocente().getId()).isEqualTo(carga.getDocente().getId()));
    }

    @Test
    void convivenciaDoesNotSubstituteAnotherStudentForMissingEnrollment() throws Exception {
        String token = "Bearer " + loginAndGetToken("coordinador@educonnect.com", TEST_SEED_PASS);
        mockMvc.perform(post("/api/v1/convivencia").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"matriculaId\":999999,\"descripcion\":\"Seguimiento ficticio\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/v1/convivencia").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"descripcion\":\"Seguimiento ficticio\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void managesUserDirectoryOnlyAsAdministratorIncludingLegacyRole() throws Exception {
        for (String email : List.of("rector@educonnect.com", "coordinador@educonnect.com", "prof.gomez@educonnect.com")) {
            String token = "Bearer " + loginAndGetToken(email, TEST_SEED_PASS);
            mockMvc.perform(get("/api/v1/admin/usuarios").header("Authorization", token))
                    .andExpect(status().isForbidden());
            mockMvc.perform(post("/api/v1/admin/usuarios").header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isForbidden());
        }
        String token = "Bearer " + loginAndGetToken("admin@educonnect.com", TEST_SEED_PASS);
        String fixtureEmail = "administrativo@example.test";
        var datos = new HashMap<>(Map.of(
                "documento", "AUD-ALIAS-01", "email", fixtureEmail, "rol", "ADMINISTRATIVO",
                "primerNombre", "Auditoría", "primerApellido", "Local"));
        mockMvc.perform(post("/api/v1/admin/usuarios").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(datos)))
                .andExpect(status().isBadRequest());
        datos.put("password", TEST_SEED_PASS);
        mockMvc.perform(post("/api/v1/admin/usuarios").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(datos)))
                .andExpect(status().isCreated());
        String legacyToken = "Bearer " + loginAndGetToken(fixtureEmail, TEST_SEED_PASS);
        mockMvc.perform(get("/api/v1/auth/me").header("Authorization", legacyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("ADMINISTRATIVO"));
        mockMvc.perform(get("/api/v1/admin/usuarios").header("Authorization", legacyToken))
                .andExpect(status().isOk());
    }

    @Test
    void disabledAccountCannotUseAnExistingTokenOrLogIn() throws Exception {
        String email = "prof.gomez@educonnect.com";
        String token = "Bearer " + loginAndGetToken(email, TEST_SEED_PASS);
        var usuario = usuarioRepository.findByEmail(email).orElseThrow();
        usuario.setEstado(false);
        usuarioRepository.save(usuario);
        try {
            mockMvc.perform(get("/api/v1/auth/me").header("Authorization", token))
                    .andExpect(status().isUnauthorized());
            mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("email", email, "password", TEST_SEED_PASS))))
                    .andExpect(status().isUnauthorized());
        } finally {
            usuario.setEstado(true);
            usuarioRepository.save(usuario);
        }
    }

    @Test
    void corsAllowsLocalFrontendAndRejectsOtherOrigins() throws Exception {
        String allowed = "http://localhost:5173";
        mockMvc.perform(options("/api/v1/auth/me").header("Origin", allowed)
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", allowed));
        mockMvc.perform(options("/api/v1/auth/me").header("Origin", "https://unlisted.example.test")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void attendanceRollsBackPartialBatchAndKeepsOneRecordOnRetry() throws Exception {
        String token = "Bearer " + loginAndGetToken("admin@educonnect.com", TEST_SEED_PASS);
        var matricula = matriculaRepository.findAll().getFirst();
        var carga = cargaAcademicaRepository.findByGrupo_Id(matricula.getGrupo().getId()).getFirst();
        var fecha = LocalDate.of(2025, 3, 17);
        var entrada = Map.<String, Object>of(
                "matriculaId", matricula.getId(), "cargaAcademicaId", carga.getId(),
                "fecha", fecha.toString(), "estado", "TARDE", "minutosRetraso", 10,
                "observacion", "Llegada después del timbre");
        var invalida = new HashMap<>(entrada);
        invalida.put("fecha", "2025-02-30");
        mockMvc.perform(post("/api/v1/asistencias/planilla").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("registros", List.of(entrada, invalida)))))
                .andExpect(status().isBadRequest());
        assertThat(asistenciaRepository.findByMatricula_IdAndCargaAcademica_IdAndFechaClase(
                matricula.getId(), carga.getId(), fecha)).isEmpty();

        for (int intento = 0; intento < 2; intento++) {
            mockMvc.perform(post("/api/v1/asistencias/planilla").header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("registros", List.of(entrada)))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].minutosRetraso").value(10));
        }
        assertThat(asistenciaRepository.findByCargaAcademica_IdAndFechaClase(carga.getId(), fecha))
                .singleElement().satisfies(registro -> assertThat(registro.getObservacion())
                        .isEqualTo("Llegada después del timbre"));
    }

    @Test
    void tutorCanConfirmOwnCitationAndOtherRolesCannotModifyIt() throws Exception {
        String tutor = "Bearer " + loginAndGetToken("juan.ramirez@gmail.com", TEST_SEED_PASS);
        String docente = "Bearer " + loginAndGetToken("prof.gomez@educonnect.com", TEST_SEED_PASS);
        String estudiante = "Bearer " + loginAndGetToken("carlosvargas@educonnect.com", TEST_SEED_PASS);
        var result = mockMvc.perform(get("/api/v1/citaciones").header("Authorization", tutor))
                .andExpect(status().isOk())
                .andReturn();
        long id = objectMapper.readTree(result.getResponse().getContentAsString()).get(0).get("id").asLong();
        for (String token : List.of(docente, estudiante)) {
            mockMvc.perform(put("/api/v1/citaciones/{id}", id).header("Authorization", token)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONFIRMADA\"}"))
                    .andExpect(status().isForbidden());
        }
        mockMvc.perform(put("/api/v1/citaciones/{id}", id).header("Authorization", tutor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"REALIZADA\"}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/citaciones/{id}", id).header("Authorization", tutor)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"CONFIRMADA\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void studentCanOnlySignOwnObservations() throws Exception {
        String owner = "Bearer " + loginAndGetToken("carlosvargas@educonnect.com", TEST_SEED_PASS);
        String otherEmail = estudianteRepository.findAll().stream()
                .map(e -> e.getUsuario().getEmail())
                .filter(email -> !email.equals("carlosvargas@educonnect.com"))
                .findFirst().orElseThrow();
        String other = "Bearer " + loginAndGetToken(otherEmail, TEST_SEED_PASS);
        var result = mockMvc.perform(get("/api/v1/observador").header("Authorization", owner))
                .andExpect(status().isOk())
                .andReturn();
        long id = objectMapper.readTree(result.getResponse().getContentAsString()).get(0).get("id").asLong();
        mockMvc.perform(put("/api/v1/observador/{id}/firmar", id).header("Authorization", other))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/observador/{id}/firmar", id).header("Authorization", owner))
                .andExpect(status().isOk());
    }

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "email", email,
                "password", password
        ));
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    @Test
    @Order(1)
    @DisplayName("1. Autenticación exitosa con BCrypt devuelve JWT válido y rol oficial")
    void testLoginSuccessReturnsJwt() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "email", "admin@educonnect.com",
                "password", TEST_SEED_PASS
        ));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.rol").value("ADMIN"))
                .andExpect(jsonPath("$.email").value("admin@educonnect.com"));
    }

    @Test
    @Order(2)
    @DisplayName("2. Autenticación fallida rechaza credenciales inválidas con 401 Unauthorized")
    void testLoginInvalidCredentialsReturns401() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "email", "admin@educonnect.com",
                "password", "ClaveIncorrecta999"
        ));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(3)
    @DisplayName("3. Solicitud sin token JWT a endpoint protegido devuelve 401 Unauthorized")
    void testUnauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/usuarios"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(4)
    @DisplayName("4. Control RBAC: un ESTUDIANTE no puede acceder a paneles de ADMIN, RECTOR ni modificar notas (403 Forbidden)")
    void testStudentCannotAccessAdminRectorOrModifyGrades() throws Exception {
        String studentToken = loginAndGetToken("carlosvargas@educonnect.com", TEST_SEED_PASS);

        mockMvc.perform(get("/api/v1/admin/usuarios")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/rector/resumen")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        String gradePayload = objectMapper.writeValueAsString(Map.of(
                "cargaAcademicaId", 1,
                "periodoId", 1,
                "notaCognitiva", 5.0,
                "notaProcedimental", 5.0,
                "notaActitudinal", 5.0
        ));
        mockMvc.perform(post("/api/v1/calificaciones")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(gradePayload))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(5)
    @DisplayName("5. Protección Anti-IDOR: un ESTUDIANTE no puede consultar calificaciones ni boletín de otro estudiante")
    void testStudentCannotQueryOtherStudentGradesOrBoletin() throws Exception {
        String studentToken = loginAndGetToken("carlosvargas@educonnect.com", TEST_SEED_PASS);

        mockMvc.perform(get("/api/v1/calificaciones?estudianteId=99999")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/boletines?estudianteId=99999")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    @DisplayName("6. Regla Decreto 1290: DOCENTE registra notas (4.5, 4.0, 5.0) y el servidor calcula 4.50 (40/30/30) y escala ALTO")
    void testTeacherRegistersDecreto1290GradesAndServerCalculatesWeightedAverage() throws Exception {
        String docenteToken = loginAndGetToken("prof.gomez@educonnect.com", TEST_SEED_PASS);

        List<Estudiante> estudiantes = estudianteRepository.findAll();
        List<CargaAcademica> cargas = cargaAcademicaRepository.findAll();
        List<PeriodoAcademico> periodos = periodoAcademicoRepository.findAll();

        assertThat(estudiantes).isNotEmpty();
        assertThat(cargas).isNotEmpty();
        assertThat(periodos).isNotEmpty();

        CargaAcademica cargaDocente = cargas.stream()
                .filter(c -> c.getDocente().getUsuario().getEmail().equalsIgnoreCase("prof.gomez@educonnect.com"))
                .findFirst()
                .orElse(cargas.get(0));

        PeriodoAcademico periodoAbierto = periodos.get(0);
        periodoAbierto.setCerrado(false);
        periodoAcademicoRepository.save(periodoAbierto);

        Estudiante estudiante = estudiantes.get(0);

        String payload = objectMapper.writeValueAsString(Map.of(
                "estudianteId", estudiante.getId(),
                "cargaAcademicaId", cargaDocente.getId(),
                "periodoId", periodoAbierto.getId(),
                "notaCognitiva", 4.5,
                "notaProcedimental", 4.0,
                "notaActitudinal", 5.0,
                "juicioValorativo", "Excelente dominio analítico y participación"
        ));

        // Cálculo esperado: 4.5 * 0.40 (1.80) + 4.0 * 0.30 (1.20) + 5.0 * 0.30 (1.50) = 4.50 -> ALTO
        mockMvc.perform(post("/api/v1/calificaciones")
                        .header("Authorization", "Bearer " + docenteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notaDefinitivaPeriodo").value(4.5))
                .andExpect(jsonPath("$.escalaDesempeno").value("ALTO"));
    }

    @Test
    @Order(7)
    @DisplayName("7. Bloqueo de Periodo Cerrado: cuando RECTOR cierra el periodo, DOCENTE no puede modificar notas directamente")
    void testClosedPeriodBlocksGradeModification() throws Exception {
        String rectorToken = loginAndGetToken("rector@educonnect.com", TEST_SEED_PASS);
        String docenteToken = loginAndGetToken("prof.gomez@educonnect.com", TEST_SEED_PASS);

        PeriodoAcademico periodo = periodoAcademicoRepository.findAll().get(0);
        CargaAcademica carga = cargaAcademicaRepository.findAll().stream()
                .filter(c -> c.getDocente().getUsuario().getEmail().equalsIgnoreCase("prof.gomez@educonnect.com"))
                .findFirst()
                .orElseThrow();
        Estudiante estudiante = estudianteRepository.findAll().get(0);

        // Rector cierra el periodo
        mockMvc.perform(put("/api/v1/rector/periodos/" + periodo.getId() + "/estado")
                        .header("Authorization", "Bearer " + rectorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("cerrado", true))))
                .andExpect(status().isOk());

        // Docente intenta modificar nota en periodo cerrado -> 400 Bad Request
        String payload = objectMapper.writeValueAsString(Map.of(
                "estudianteId", estudiante.getId(),
                "cargaAcademicaId", carga.getId(),
                "periodoId", periodo.getId(),
                "notaCognitiva", 5.0,
                "notaProcedimental", 5.0,
                "notaActitudinal", 5.0
        ));
        mockMvc.perform(post("/api/v1/calificaciones")
                        .header("Authorization", "Bearer " + docenteToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());

        // Rector reabre el periodo para el resto de pruebas
        mockMvc.perform(put("/api/v1/rector/periodos/" + periodo.getId() + "/estado")
                        .header("Authorization", "Bearer " + rectorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("cerrado", false))))
                .andExpect(status().isOk());
    }

    @Test
    @Order(8)
    @DisplayName("8. Recuperación de contraseña no expone el código OTP en la respuesta HTTP y guarda hash BCrypt")
    void testPasswordRecoveryDoesNotLeakOtpAndHashesInDatabase() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "email", "prof.gomez@educonnect.com"
        ));

        MvcResult result = mockMvc.perform(post("/api/v1/auth/olvide-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.devCode").doesNotExist())
                .andExpect(jsonPath("$.codigo").doesNotExist())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("codigoHash");

        List<CodigoRecuperacion> codigos = codigoRecuperacionRepository.findAll();
        assertThat(codigos).isNotEmpty();
        assertThat(codigos.get(0).getCodigo()).startsWith("$2");
    }

    @Test
    @Order(9)
    @DisplayName("9. Validación de colisiones de horario rechaza bloques duplicados para el mismo grupo y franja")
    void testScheduleCollisionDetectionRejectsDuplicateSlot() throws Exception {
        String coordToken = loginAndGetToken("coordinador@educonnect.com", TEST_SEED_PASS);

        String bloque = objectMapper.writeValueAsString(Map.of(
                "grupo", "10-A",
                "dia", "VIERNES",
                "horaInicio", "11:30",
                "horaFin", "12:30",
                "materia", "Cálculo y Trigonometría",
                "docente", "Roberto Arturo Silva Pineda",
                "aula", "Aula 201"
        ));

        // Primera inserción válida (201 Created)
        mockMvc.perform(post("/api/v1/horarios")
                        .header("Authorization", "Bearer " + coordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bloque))
                .andExpect(status().isCreated());

        // Segunda inserción en el mismo día y hora para el mismo grupo -> 400 Bad Request
        mockMvc.perform(post("/api/v1/horarios")
                        .header("Authorization", "Bearer " + coordToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bloque))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(10)
    @DisplayName("10. Seguridad de datos: el listado de usuarios jamás expone passwordHash")
    void testAdminUsersEndpointNeverExposesPasswordHash() throws Exception {
        String adminToken = loginAndGetToken("admin@educonnect.com", TEST_SEED_PASS);

        MvcResult result = mockMvc.perform(get("/api/v1/admin/usuarios")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).doesNotContain("passwordHash");
        assertThat(responseBody).doesNotContain("$2a$");
    }
}
