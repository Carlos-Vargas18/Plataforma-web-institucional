package com.educonnect;

import com.educonnect.dto.CalificacionRequest;
import com.educonnect.exception.BusinessException;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import com.educonnect.service.CalificacionService;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalificacionIntegrityTests {

    @Mock private CalificacionRepository calificacionRepository;
    @Mock private MatriculaRepository matriculaRepository;
    @Mock private CargaAcademicaRepository cargaAcademicaRepository;
    @Mock private PeriodoAcademicoRepository periodoAcademicoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private DocenteRepository docenteRepository;
    @Mock private EstudianteRepository estudianteRepository;
    @Mock private EstudianteTutorRepository estudianteTutorRepository;
    @Mock private SolicitudModificacionNotaRepository solicitudRepository;
    @InjectMocks private CalificacionService service;

    @Test
    void inputPrecisionMatchesStoredGradePrecision() {
        CalificacionRequest request = new CalificacionRequest();
        request.setCargaAcademicaId(1L);
        request.setPeriodoId(1L);
        request.setNotaCognitiva(new BigDecimal("4.54"));
        request.setNotaProcedimental(new BigDecimal("4.5"));
        request.setNotaActitudinal(new BigDecimal("4.5"));

        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertThat(factory.getValidator().validate(request))
                    .extracting(violation -> violation.getPropertyPath().toString())
                    .containsExactly("notaCognitiva");
        }
    }

    @Test
    void rejectsPeriodFromAnotherSchoolYearBeforeSaving() {
        var editor = Usuario.builder().id(1L).rol(Rol.ADMIN).build();
        var current = AnioLectivo.builder().id(1L).build();
        var other = AnioLectivo.builder().id(2L).build();
        var group = Grupo.builder().id(1L).anioLectivo(current).build();
        when(usuarioRepository.findByEmail("admin@example.test")).thenReturn(Optional.of(editor));
        when(cargaAcademicaRepository.findById(1L))
                .thenReturn(Optional.of(CargaAcademica.builder().grupo(group).build()));
        when(periodoAcademicoRepository.findById(2L))
                .thenReturn(Optional.of(PeriodoAcademico.builder().anioLectivo(other).build()));
        when(matriculaRepository.findById(1L)).thenReturn(Optional.of(Matricula.builder()
                .id(1L).anioLectivo(current).grupo(group).build()));
        var request = new CalificacionRequest();
        request.setCargaAcademicaId(1L);
        request.setMatriculaId(1L);
        request.setPeriodoId(2L);
        request.setNotaCognitiva(new BigDecimal("4.5"));
        request.setNotaProcedimental(new BigDecimal("4.5"));
        request.setNotaActitudinal(new BigDecimal("4.5"));

        assertThatThrownBy(() -> service.registrarOActualizarNota(request, "admin@example.test"))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(calificacionRepository);
    }

    @Test
    void rejectsChangeRequestWithGradeOutsideScaleBeforeSaving() {
        when(usuarioRepository.findByEmail("docente@example.test"))
                .thenReturn(Optional.of(Usuario.builder().id(1L).rol(Rol.DOCENTE).build()));
        when(docenteRepository.findByUsuario_Id(1L)).thenReturn(Optional.of(Docente.builder().id(1L).build()));

        assertThatThrownBy(() -> service.crearSolicitudModificacion(
                Map.of("notaNueva", "5.1", "motivo", "Corrección pedagógica"), "docente@example.test"))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(solicitudRepository);
    }
}
