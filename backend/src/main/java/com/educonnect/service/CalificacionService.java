package com.educonnect.service;

import com.educonnect.dto.CalificacionRequest;
import com.educonnect.exception.BusinessException;
import com.educonnect.exception.ForbiddenAccessException;
import com.educonnect.exception.ResourceNotFoundException;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final MatriculaRepository matriculaRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DocenteRepository docenteRepository;
    private final EstudianteRepository estudianteRepository;
    private final EstudianteTutorRepository estudianteTutorRepository;
    private final SolicitudModificacionNotaRepository solicitudRepository;

    @Transactional
    public Map<String, Object> registrarOActualizarNota(CalificacionRequest req, String emailEditor) {
        Usuario editor = usuarioRepository.findByEmail(emailEditor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado."));

        CargaAcademica carga = cargaAcademicaRepository.findById(req.getCargaAcademicaId())
                .orElseThrow(() -> new ResourceNotFoundException("La carga académica especificada no existe."));

        // Validar titularidad docente si el usuario es DOCENTE o DIRECTOR_GRUPO
        if (editor.getRol() == Rol.DOCENTE || editor.getRol() == Rol.DIRECTOR_GRUPO) {
            if (carga.getDocente() == null || carga.getDocente().getUsuario() == null
                    || !carga.getDocente().getUsuario().getId().equals(editor.getId())) {
                throw new ForbiddenAccessException("No tiene autorización para modificar calificaciones de una materia asignada a otro docente.");
            }
        } else if (!editor.getRol().esAdministrador() && editor.getRol() != Rol.RECTOR && editor.getRol() != Rol.COORDINADOR) {
            throw new ForbiddenAccessException("Su rol no tiene autorización para registrar o alterar calificaciones.");
        }

        PeriodoAcademico periodo = periodoAcademicoRepository.findById(req.getPeriodoId())
                .orElseThrow(() -> new ResourceNotFoundException("El periodo académico especificado no existe."));

        if (Boolean.TRUE.equals(periodo.getCerrado()) && !editor.getRol().esAdministrador() && editor.getRol() != Rol.RECTOR) {
            throw new BusinessException("El " + periodo.getNombre() + " se encuentra cerrado oficialmente. Debe radicar una Solicitud de Reapertura/Modificación ante Rectoría.");
        }

        Matricula matricula;
        if (req.getMatriculaId() != null) {
            matricula = matriculaRepository.findById(req.getMatriculaId())
                    .orElseThrow(() -> new ResourceNotFoundException("La matrícula del estudiante no existe."));
        } else if (req.getEstudianteId() != null) {
            List<Matricula> mats = matriculaRepository.findByEstudiante_Id(req.getEstudianteId());
            if (mats.isEmpty()) {
                mats = matriculaRepository.findByEstudiante_Usuario_Id(req.getEstudianteId());
            }
            if (mats.isEmpty()) {
                throw new ResourceNotFoundException("No se encontró matrícula activa para el estudiante indicado.");
            }
            matricula = mats.get(0);
        } else {
            throw new BusinessException("Debe indicar la matrícula o el ID del estudiante a calificar.");
        }

        if (carga.getGrupo() != null && matricula.getGrupo() != null
                && !carga.getGrupo().getId().equals(matricula.getGrupo().getId())) {
            throw new BusinessException("El estudiante no pertenece al grupo correspondiente a esta carga académica.");
        }

        if (!Objects.equals(periodo.getAnioLectivo().getId(), matricula.getAnioLectivo().getId())) {
            throw new BusinessException("El periodo y la matrícula deben pertenecer al mismo año lectivo.");
        }

        BigDecimal definitiva = calcularDefinitivaDecreto1290(
                req.getNotaCognitiva(),
                req.getNotaProcedimental(),
                req.getNotaActitudinal()
        );
        String escala = determinarEscalaDesempeno(definitiva);

        Calificacion calificacion = calificacionRepository
                .findByMatricula_IdAndCargaAcademica_IdAndPeriodo_Id(matricula.getId(), carga.getId(), periodo.getId())
                .orElse(Calificacion.builder()
                        .matricula(matricula)
                        .cargaAcademica(carga)
                        .periodo(periodo)
                        .fechaRegistro(LocalDateTime.now())
                        .build());

        calificacion.setNotaCognitiva(req.getNotaCognitiva());
        calificacion.setNotaProcedimental(req.getNotaProcedimental());
        calificacion.setNotaActitudinal(req.getNotaActitudinal());
        calificacion.setNotaDefinitivaPeriodo(definitiva);
        calificacion.setEscalaDesempeno(escala);
        calificacion.setJuicioValorativo(req.getJuicioValorativo() != null && !req.getJuicioValorativo().isBlank()
                ? req.getJuicioValorativo()
                : generarJuicioAutomatico(escala, carga.getMateria().getNombre()));
        calificacion.setPlanMejoramiento(req.getPlanMejoramiento());
        calificacion.setModificadoPor(editor);
        calificacion.setFechaUltimaModificacion(LocalDateTime.now());

        Calificacion guardada = calificacionRepository.save(calificacion);
        return mapCalificacionToMap(guardada);
    }

    @Transactional
    public List<Map<String, Object>> guardarPlanilla(List<CalificacionRequest> registros, String email) {
        return registros.stream().map(registro -> registrarOActualizarNota(registro, email)).toList();
    }

    public BigDecimal calcularDefinitivaDecreto1290(BigDecimal cognitiva, BigDecimal procedimental, BigDecimal actitudinal) {
        BigDecimal saber = cognitiva.multiply(new BigDecimal("0.40"));
        BigDecimal hacer = procedimental.multiply(new BigDecimal("0.30"));
        BigDecimal ser = actitudinal.multiply(new BigDecimal("0.30"));
        return saber.add(hacer).add(ser).setScale(1, RoundingMode.HALF_UP);
    }

    public String determinarEscalaDesempeno(BigDecimal definitiva) {
        if (definitiva.compareTo(new BigDecimal("4.6")) >= 0) return "SUPERIOR";
        if (definitiva.compareTo(new BigDecimal("4.0")) >= 0) return "ALTO";
        if (definitiva.compareTo(new BigDecimal("3.0")) >= 0) return "BASICO";
        return "BAJO";
    }

    private String generarJuicioAutomatico(String escala, String materia) {
        return switch (escala) {
            case "SUPERIOR" -> "Alcanza con excelencia todos los desempeños cognitivos, procedimentales y actitudinales en " + materia + ".";
            case "ALTO" -> "Demuestra un dominio sólido y satisfactorio de las competencias evaluadas en " + materia + ".";
            case "BASICO" -> "Supera los desempeños mínimos requeridos en " + materia + ", con oportunidades de profundización.";
            default -> "Presenta dificultades en la apropiación de competencias de " + materia + ". Requiere plan de mejoramiento.";
        };
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> consultarCalificaciones(
            Long cargaAcademicaId,
            Long periodoId,
            Long estudianteId,
            Long grupoId,
            String emailSolicitante
    ) {
        Usuario solicitante = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        // Regla estricta de seguridad: un ESTUDIANTE solo puede consultar sus propias calificaciones
        if (solicitante.getRol() == Rol.ESTUDIANTE) {
            Estudiante miEstudiante = estudianteRepository.findByUsuario_Id(solicitante.getId())
                    .orElseThrow(() -> new ForbiddenAccessException("Perfil estudiantil no encontrado."));
            if (estudianteId != null && !estudianteId.equals(miEstudiante.getId()) && !estudianteId.equals(solicitante.getId())) {
                throw new ForbiddenAccessException("Acceso denegado: un estudiante no puede consultar calificaciones de otro estudiante.");
            }
            return calificacionRepository.findByMatricula_Estudiante_Id(miEstudiante.getId())
                    .stream().map(this::mapCalificacionToMap).toList();
        }

        // Un TUTOR solo puede consultar calificaciones de sus acudidos vinculados
        if (solicitante.getRol() == Rol.TUTOR) {
            List<EstudianteTutor> vinculos = estudianteTutorRepository.findByTutor_Usuario_Id(solicitante.getId());
            Set<Long> idsAutorizados = new HashSet<>();
            for (EstudianteTutor et : vinculos) {
                if (et.getEstudiante() != null) {
                    idsAutorizados.add(et.getEstudiante().getId());
                }
            }
            if (estudianteId != null) {
                Optional<Estudiante> estPorUsuario = estudianteRepository.findByUsuario_Id(estudianteId);
                Long realEstId = estPorUsuario.map(Estudiante::getId).orElse(estudianteId);
                if (!idsAutorizados.contains(realEstId)) {
                    throw new ForbiddenAccessException("Acceso denegado: el estudiante consultado no está vinculado a su cuenta de acudiente.");
                }
                return calificacionRepository.findByMatricula_Estudiante_Id(realEstId)
                        .stream().map(this::mapCalificacionToMap).toList();
            }
            List<Map<String, Object>> resultado = new ArrayList<>();
            for (Long idEst : idsAutorizados) {
                calificacionRepository.findByMatricula_Estudiante_Id(idEst)
                        .forEach(c -> resultado.add(mapCalificacionToMap(c)));
            }
            return resultado;
        }

        List<Calificacion> lista;
        if (cargaAcademicaId != null && periodoId != null) {
            lista = calificacionRepository.findByCargaAcademica_IdAndPeriodo_Id(cargaAcademicaId, periodoId);
        } else if (estudianteId != null) {
            lista = calificacionRepository.findByMatricula_Estudiante_Id(estudianteId);
            if (lista.isEmpty()) {
                lista = calificacionRepository.findByMatricula_Estudiante_Usuario_Id(estudianteId);
            }
        } else if (grupoId != null) {
            lista = calificacionRepository.findByMatricula_Grupo_Id(grupoId);
        } else if (solicitante.getRol() == Rol.DOCENTE) {
            Docente doc = docenteRepository.findByUsuario_Id(solicitante.getId()).orElse(null);
            lista = doc != null ? calificacionRepository.findByCargaAcademica_Docente_Id(doc.getId()) : List.of();
        } else {
            lista = calificacionRepository.findAll();
        }

        return lista.stream().map(this::mapCalificacionToMap).toList();
    }

    @Transactional
    public Map<String, Object> crearSolicitudModificacion(Map<String, Object> payload, String emailDocente) {
        Usuario usuario = usuarioRepository.findByEmail(emailDocente)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        Docente docente = docenteRepository.findByUsuario_Id(usuario.getId())
                .orElseThrow(() -> new ForbiddenAccessException("Solo un docente registrado puede solicitar modificación de notas."));

        Calificacion calificacion = null;
        if (payload.get("calificacionId") != null) {
            calificacion = calificacionRepository.findById(Long.valueOf(payload.get("calificacionId").toString()))
                    .orElseThrow(() -> new ResourceNotFoundException("La calificación especificada no existe."));
            if (!Objects.equals(calificacion.getCargaAcademica().getDocente().getId(), docente.getId())) {
                throw new ForbiddenAccessException("Solo puede solicitar cambios de notas de sus cargas académicas.");
            }
        }

        Object notaComun = payload.getOrDefault("notaNueva", "4.0");
        BigDecimal n1 = validarNotaPropuesta(payload.getOrDefault("notaNuevaCognitiva", notaComun));
        BigDecimal n2 = validarNotaPropuesta(payload.getOrDefault("notaNuevaProcedimental", notaComun));
        BigDecimal n3 = validarNotaPropuesta(payload.getOrDefault("notaNuevaActitudinal", notaComun));
        BigDecimal defNueva = calcularDefinitivaDecreto1290(n1, n2, n3);
        BigDecimal notaAnt = new BigDecimal(Objects.toString(payload.getOrDefault("notaAnterior", calificacion != null ? calificacion.getNotaDefinitivaPeriodo() : "3.0")));

        String estNombre = Objects.toString(payload.getOrDefault("estudianteNombre", payload.getOrDefault("estudiante",
                calificacion != null ? calificacion.getMatricula().getEstudiante().getUsuario().getNombreCompleto() : "Estudiante")), "");
        String matNombre = Objects.toString(payload.getOrDefault("materiaNombre", payload.getOrDefault("materia",
                calificacion != null ? calificacion.getCargaAcademica().getMateria().getNombre() : "Asignatura")), "");
        String grpCodigo = Objects.toString(payload.getOrDefault("grupoCodigo", payload.getOrDefault("grupo",
                calificacion != null ? calificacion.getMatricula().getGrupo().getCodigoGrupo() : "10-A")), "");
        String perNombre = Objects.toString(payload.getOrDefault("periodoNombre", payload.getOrDefault("periodo",
                calificacion != null ? calificacion.getPeriodo().getNombre() : "Periodo 1")), "");
        String motivo = Objects.toString(payload.getOrDefault("motivo", ""), "").trim();

        if (motivo.isBlank()) {
            throw new BusinessException("Debe especificar el motivo pedagógico o administrativo de la solicitud.");
        }

        SolicitudModificacionNota sol = SolicitudModificacionNota.builder()
                .calificacion(calificacion)
                .docente(docente)
                .estudianteNombre(estNombre)
                .materiaNombre(matNombre)
                .grupoCodigo(grpCodigo)
                .periodoNombre(perNombre)
                .notaAnterior(notaAnt)
                .notaNuevaCognitiva(n1)
                .notaNuevaProcedimental(n2)
                .notaNuevaActitudinal(n3)
                .notaNuevaDefinitiva(defNueva)
                .motivo(motivo)
                .estado("PENDIENTE")
                .fechaSolicitud(LocalDateTime.now())
                .build();

        SolicitudModificacionNota guardada = solicitudRepository.save(sol);
        return mapSolicitudToMap(guardada);
    }

    private BigDecimal validarNotaPropuesta(Object valor) {
        try {
            BigDecimal nota = new BigDecimal(Objects.toString(valor, ""));
            if (nota.scale() <= 1 && nota.compareTo(BigDecimal.ONE) >= 0
                    && nota.compareTo(BigDecimal.valueOf(5)) <= 0) {
                return nota;
            }
        } catch (NumberFormatException ignored) {
            // El mismo mensaje cubre entradas no numéricas y fuera de escala.
        }
        throw new BusinessException("La nota propuesta debe estar entre 1.0 y 5.0 y tener como máximo un decimal.");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarSolicitudesModificacion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        var solicitudes = usuario.getRol() == Rol.DOCENTE || usuario.getRol() == Rol.DIRECTOR_GRUPO
                ? solicitudRepository.findByDocente_Usuario_IdOrderByFechaSolicitudDesc(usuario.getId())
                : solicitudRepository.findAllByOrderByFechaSolicitudDesc();
        return solicitudes.stream().map(this::mapSolicitudToMap).toList();
    }

    public Map<String, Object> mapSolicitudToMap(SolicitudModificacionNota s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("calificacionId", s.getCalificacion() != null ? s.getCalificacion().getId() : null);
        m.put("docente", s.getDocente() != null && s.getDocente().getUsuario() != null ? s.getDocente().getUsuario().getNombreCompleto() : "Docente");
        m.put("estudiante", s.getEstudianteNombre());
        m.put("estudianteNombre", s.getEstudianteNombre());
        m.put("materia", s.getMateriaNombre());
        m.put("materiaNombre", s.getMateriaNombre());
        m.put("grupo", s.getGrupoCodigo());
        m.put("periodo", s.getPeriodoNombre());
        m.put("notaAnterior", s.getNotaAnterior());
        m.put("notaNueva", s.getNotaNuevaDefinitiva());
        m.put("notaNuevaCognitiva", s.getNotaNuevaCognitiva());
        m.put("notaNuevaProcedimental", s.getNotaNuevaProcedimental());
        m.put("notaNuevaActitudinal", s.getNotaNuevaActitudinal());
        m.put("motivo", s.getMotivo());
        m.put("estado", s.getEstado());
        m.put("comentarioResolucion", s.getComentarioResolucion());
        m.put("fecha", s.getFechaSolicitud() != null ? s.getFechaSolicitud().toLocalDate().toString() : "");
        return m;
    }

    public Map<String, Object> mapCalificacionToMap(Calificacion c) {
        Usuario uEst = c.getMatricula() != null && c.getMatricula().getEstudiante() != null
                ? c.getMatricula().getEstudiante().getUsuario() : null;
        Materia mat = c.getCargaAcademica() != null ? c.getCargaAcademica().getMateria() : null;
        Docente doc = c.getCargaAcademica() != null ? c.getCargaAcademica().getDocente() : null;
        Grupo grp = c.getMatricula() != null ? c.getMatricula().getGrupo() : null;
        PeriodoAcademico per = c.getPeriodo();

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("matriculaId", c.getMatricula() != null ? c.getMatricula().getId() : null);
        m.put("estudianteId", c.getMatricula() != null && c.getMatricula().getEstudiante() != null ? c.getMatricula().getEstudiante().getId() : null);
        m.put("estudianteUsuarioId", uEst != null ? uEst.getId() : null);
        m.put("estudianteNombre", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("documentoEstudiante", uEst != null ? uEst.getDocumento() : "");
        m.put("grupoId", grp != null ? grp.getId() : null);
        m.put("grupo", grp != null ? grp.getCodigoGrupo() : "");
        m.put("cargaAcademicaId", c.getCargaAcademica() != null ? c.getCargaAcademica().getId() : null);
        m.put("materiaId", mat != null ? mat.getId() : null);
        m.put("materia", mat != null ? mat.getNombre() : "");
        m.put("area", mat != null ? mat.getAreaConocimiento() : "");
        m.put("intensidadHoraria", c.getCargaAcademica() != null ? c.getCargaAcademica().getIntensidadHoraria() : 4);
        m.put("docente", doc != null && doc.getUsuario() != null ? doc.getUsuario().getNombreCompleto() : "");
        m.put("periodoId", per != null ? per.getId() : null);
        m.put("numeroPeriodo", per != null ? per.getNumeroPeriodo() : 1);
        m.put("periodoNombre", per != null ? per.getNombre() : "Periodo 1");
        m.put("periodoCerrado", per != null ? per.getCerrado() : false);
        m.put("notaCognitiva", c.getNotaCognitiva());
        m.put("notaProcedimental", c.getNotaProcedimental());
        m.put("notaActitudinal", c.getNotaActitudinal());
        m.put("nota1", c.getNotaCognitiva());
        m.put("nota2", c.getNotaProcedimental());
        m.put("nota3", c.getNotaActitudinal());
        m.put("notaDefinitivaPeriodo", c.getNotaDefinitivaPeriodo());
        m.put("notaFinal", c.getNotaDefinitivaPeriodo());
        m.put("definitiva", c.getNotaDefinitivaPeriodo());
        m.put("escalaDesempeno", c.getEscalaDesempeno());
        m.put("desempeno", c.getEscalaDesempeno());
        m.put("juicioValorativo", c.getJuicioValorativo());
        m.put("observaciones", c.getJuicioValorativo());
        m.put("planMejoramiento", c.getPlanMejoramiento());
        return m;
    }
}
