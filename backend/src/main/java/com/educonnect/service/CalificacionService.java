package com.educonnect.service;

import com.educonnect.dto.CalificacionRequest;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final MatriculaRepository matriculaRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final DocenteRepository docenteRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Calificacion registrarOActualizarCalificacion(CalificacionRequest request, String emailDocente) {
        Matricula matricula = matriculaRepository.findById(request.getMatriculaId())
                .orElseThrow(() -> new IllegalArgumentException("Matrícula no encontrada"));

        CargaAcademica carga = cargaAcademicaRepository.findById(request.getCargaAcademicaId())
                .orElseThrow(() -> new IllegalArgumentException("Carga académica no encontrada"));

        PeriodoAcademico periodo = periodoAcademicoRepository.findById(request.getPeriodoId())
                .orElseThrow(() -> new IllegalArgumentException("Periodo académico no encontrado"));

        if (periodo.isCerrado()) {
            throw new IllegalStateException("El periodo académico se encuentra cerrado para modificaciones");
        }

        Usuario docenteUsuario = usuarioRepository.findByEmail(emailDocente)
                .orElseThrow(() -> new IllegalArgumentException("Docente no autenticado"));

        Docente docente = docenteRepository.findByUsuarioId(docenteUsuario.getId()).orElse(null);

        Calificacion calificacion = calificacionRepository
                .findByMatriculaIdAndCargaAcademicaIdAndPeriodoId(matricula.getId(), carga.getId(), periodo.getId())
                .orElse(Calificacion.builder()
                        .matricula(matricula)
                        .cargaAcademica(carga)
                        .periodo(periodo)
                        .build());

        calificacion.setNotaCognitiva(request.getNotaCognitiva());
        calificacion.setNotaProcedimental(request.getNotaProcedimental());
        calificacion.setNotaActitudinal(request.getNotaActitudinal());
        calificacion.setObservaciones(request.getObservaciones());
        calificacion.setActualizadoPorDocente(docente);

        calificacion.calcularNotaDefinitiva();

        return calificacionRepository.save(calificacion);
    }

    @Transactional(readOnly = true)
    public List<Calificacion> obtenerCalificacionesPorMatricula(Long matriculaId) {
        return calificacionRepository.findByMatriculaId(matriculaId);
    }

    @Transactional(readOnly = true)
    public List<Calificacion> obtenerCalificacionesPorCargaYPeriodo(Long cargaId, Long periodoId) {
        return calificacionRepository.findByCargaAcademicaIdAndPeriodoId(cargaId, periodoId);
    }
}
