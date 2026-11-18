package com.educonnect;

import com.educonnect.model.CargaAcademica;
import com.educonnect.model.CodigoRecuperacion;
import com.educonnect.model.Estudiante;
import com.educonnect.model.PeriodoAcademico;
import com.educonnect.repository.CargaAcademicaRepository;
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
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
    private PeriodoAcademicoRepository periodoAcademicoRepository;

    @Autowired
    private CodigoRecuperacionRepository codigoRecuperacionRepository;

    private static final String TEST_SEED_PASS = "123456";

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
