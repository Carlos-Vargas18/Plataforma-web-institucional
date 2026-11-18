package com.educonnect.service;

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
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AcademicoInstitucionalService {

    private final AsistenciaRepository asistenciaRepository;
    private final JustificacionInasistenciaRepository justificacionRepository;
    private final HorarioEscolarRepository horarioRepository;
    private final ComunicadoRepository comunicadoRepository;
    private final ObservadorEstudianteRepository observadorRepository;
    private final CitacionPadreRepository citacionRepository;
    private final MatriculaRepository matriculaRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final PeriodoAcademicoRepository periodoRepository;
    private final AnioLectivoRepository anioLectivoRepository;
    private final GrupoRepository grupoRepository;
    private final MateriaRepository materiaRepository;
    private final DocenteRepository docenteRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;
    private final EstudianteTutorRepository estudianteTutorRepository;
    private final UsuarioRepository usuarioRepository;
    private final CalificacionRepository calificacionRepository;
    private final CalificacionService calificacionService;

    // =========================================================================
    // 1. ASISTENCIA DIARIA Y JUSTIFICACIONES
    // =========================================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> consultarAsistencias(Long estudianteId, Long cargaId, LocalDate fecha, String emailSolicitante) {
        Usuario solicitante = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (solicitante.getRol() == Rol.ESTUDIANTE) {
            Estudiante miEst = estudianteRepository.findByUsuario_Id(solicitante.getId())
                    .orElseThrow(() -> new ForbiddenAccessException("Perfil estudiantil no encontrado."));
            if (estudianteId != null && !estudianteId.equals(miEst.getId()) && !estudianteId.equals(solicitante.getId())) {
                throw new ForbiddenAccessException("Acceso denegado: no puede consultar la asistencia de otro estudiante.");
            }
            return asistenciaRepository.findByMatricula_Estudiante_IdOrderByFechaClaseDesc(miEst.getId())
                    .stream().map(this::mapAsistencia).toList();
        }

        if (solicitante.getRol() == Rol.TUTOR) {
            List<EstudianteTutor> vinculos = estudianteTutorRepository.findByTutor_Usuario_Id(solicitante.getId());
            Set<Long> permitidos = new HashSet<>();
            vinculos.forEach(v -> {
                if (v.getEstudiante() != null) permitidos.add(v.getEstudiante().getId());
            });
            List<Asistencia> res = new ArrayList<>();
            for (Long idEst : permitidos) {
                if (estudianteId == null || estudianteId.equals(idEst)) {
                    res.addAll(asistenciaRepository.findByMatricula_Estudiante_IdOrderByFechaClaseDesc(idEst));
                }
            }
            return res.stream().map(this::mapAsistencia).toList();
        }

        List<Asistencia> lista;
        if (cargaId != null && fecha != null) {
            lista = asistenciaRepository.findByCargaAcademica_IdAndFechaClase(cargaId, fecha);
        } else if (estudianteId != null) {
            lista = asistenciaRepository.findByMatricula_Estudiante_IdOrderByFechaClaseDesc(estudianteId);
            if (lista.isEmpty()) {
                lista = asistenciaRepository.findByMatricula_Estudiante_Usuario_IdOrderByFechaClaseDesc(estudianteId);
            }
        } else if (solicitante.getRol() == Rol.DOCENTE) {
            Docente doc = docenteRepository.findByUsuario_Id(solicitante.getId()).orElse(null);
            lista = doc != null ? asistenciaRepository.findByCargaAcademica_Docente_IdOrderByFechaClaseDesc(doc.getId()) : List.of();
        } else {
            lista = asistenciaRepository.findAll();
        }
        return lista.stream().map(this::mapAsistencia).toList();
    }

    @Transactional
    public Map<String, Object> registrarAsistencia(Map<String, Object> payload, String emailDocente) {
        Usuario editor = usuarioRepository.findByEmail(emailDocente)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        Matricula matricula = resolverMatricula(payload);
        CargaAcademica carga = resolverCargaAcademica(payload, matricula.getGrupo(), editor);

        if (editor.getRol() == Rol.DOCENTE && carga.getDocente() != null && carga.getDocente().getUsuario() != null
                && !carga.getDocente().getUsuario().getId().equals(editor.getId())) {
            throw new ForbiddenAccessException("No tiene autorización para registrar asistencia en una carga académica ajena.");
        }

        PeriodoAcademico periodo = resolverPeriodoActivo(payload);
        LocalDate fechaClase = payload.get("fecha") != null && !payload.get("fecha").toString().isBlank()
                ? LocalDate.parse(payload.get("fecha").toString().substring(0, 10))
                : LocalDate.now();

        String estadoRaw = Objects.toString(payload.getOrDefault("estadoAsistencia", payload.getOrDefault("estado", "PRESENTE")), "PRESENTE")
                .trim().toUpperCase();
        if ("EXCUSA".equals(estadoRaw) || "JUSTIFICADA".equals(estadoRaw)) {
            estadoRaw = "EXCUSA_MEDICA";
        }
        String obs = Objects.toString(payload.getOrDefault("observacion", ""), "");

        Asistencia asistencia = asistenciaRepository
                .findByMatricula_IdAndCargaAcademica_IdAndFechaClase(matricula.getId(), carga.getId(), fechaClase)
                .orElse(Asistencia.builder()
                        .matricula(matricula)
                        .cargaAcademica(carga)
                        .periodo(periodo)
                        .fechaClase(fechaClase)
                        .build());

        asistencia.setEstadoAsistencia(estadoRaw);
        asistencia.setObservacion(obs);
        asistencia.setJustificada("EXCUSA_MEDICA".equals(estadoRaw) || "PERMISO_INSTITUCIONAL".equals(estadoRaw));
        if ("TARDE".equals(estadoRaw) && (asistencia.getMinutosRetraso() == null || asistencia.getMinutosRetraso() == 0)) {
            asistencia.setMinutosRetraso(15);
        }

        return mapAsistencia(asistenciaRepository.save(asistencia));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarJustificaciones(String emailSolicitante) {
        Usuario u = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        List<JustificacionInasistencia> lista = (u.getRol() == Rol.TUTOR)
                ? justificacionRepository.findByTutor_Usuario_IdOrderByFechaRadicacionDesc(u.getId())
                : justificacionRepository.findAllByOrderByFechaRadicacionDesc();
        return lista.stream().map(this::mapJustificacion).toList();
    }

    @Transactional
    public Map<String, Object> radicarJustificacion(Map<String, Object> payload, String emailSolicitante) {
        Usuario u = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        Tutor tutor = tutorRepository.findByUsuario_Id(u.getId())
                .orElseGet(() -> tutorRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("No se encontró perfil de acudiente para radicar la excusa.")));

        Asistencia asistencia = null;
        if (payload.get("asistenciaId") != null) {
            asistencia = asistenciaRepository.findById(Long.valueOf(payload.get("asistenciaId").toString())).orElse(null);
        }
        if (asistencia == null) {
            // Si el acudiente selecciona fecha y estudiante, vinculamos o creamos el registro de inasistencia correspondiente
            Matricula mat = resolverMatricula(payload);
            CargaAcademica carga = cargaAcademicaRepository.findByGrupo_Id(mat.getGrupo().getId()).stream().findFirst()
                    .orElseGet(() -> cargaAcademicaRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new BusinessException("No existe carga académica para vincular la inasistencia.")));
            PeriodoAcademico per = resolverPeriodoActivo(payload);
            LocalDate fecha = payload.get("fecha") != null && !payload.get("fecha").toString().isBlank()
                    ? LocalDate.parse(payload.get("fecha").toString().substring(0, 10))
                    : LocalDate.now();
            asistencia = asistenciaRepository.findByMatricula_IdAndCargaAcademica_IdAndFechaClase(mat.getId(), carga.getId(), fecha)
                    .orElseGet(() -> asistenciaRepository.save(Asistencia.builder()
                            .matricula(mat)
                            .cargaAcademica(carga)
                            .periodo(per)
                            .fechaClase(fecha)
                            .estadoAsistencia("AUSENTE")
                            .justificada(false)
                            .observacion("Inasistencia reportada para justificación")
                            .build()));
        }

        String motivo = Objects.toString(payload.getOrDefault("motivo", payload.getOrDefault("motivoExcusa", "")), "").trim();
        if (motivo.isBlank()) {
            throw new BusinessException("Debe describir el motivo de la excusa o inasistencia.");
        }
        String tipo = Objects.toString(payload.getOrDefault("tipo", payload.getOrDefault("tipoExcusa", "MEDICA")), "MEDICA")
                .trim().toUpperCase().replace(" ", "_");
        if (!List.of("MEDICA", "CALAMIDAD_DOMESTICA", "FUERZA_MAYOR", "REPRESENTACION_DEPORTIVA").contains(tipo)) {
            tipo = "MEDICA";
        }

        JustificacionInasistencia justificacion = justificacionRepository.findByAsistencia_Id(asistencia.getId())
                .orElse(JustificacionInasistencia.builder()
                        .asistencia(asistencia)
                        .tutor(tutor)
                        .fechaRadicacion(LocalDateTime.now())
                        .build());

        justificacion.setMotivoExcusa(motivo);
        justificacion.setTipoExcusa(tipo);
        justificacion.setSoporteUrl(Objects.toString(payload.getOrDefault("soporte", payload.getOrDefault("soporteUrl", "soporte-adjunto.pdf")), "soporte-adjunto.pdf"));
        justificacion.setEstadoRevision("PENDIENTE_REVISION");

        return mapJustificacion(justificacionRepository.save(justificacion));
    }

    @Transactional
    public Map<String, Object> revisarJustificacion(Long id, Map<String, Object> payload, String emailRevisor) {
        Usuario revisor = usuarioRepository.findByEmail(emailRevisor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        JustificacionInasistencia j = justificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Justificación no encontrada."));

        String estado = Objects.toString(payload.getOrDefault("estado", "APROBADA_COORDINACION"), "APROBADA_COORDINACION").toUpperCase();
        if (estado.contains("APROB")) {
            estado = "APROBADA_COORDINACION";
            Asistencia a = j.getAsistencia();
            if (a != null) {
                a.setJustificada(true);
                a.setEstadoAsistencia("EXCUSA_MEDICA");
                asistenciaRepository.save(a);
            }
        } else if (estado.contains("RECHAZ")) {
            estado = "RECHAZADA";
        }

        j.setEstadoRevision(estado);
        j.setRevisadoPor(revisor);
        j.setObservacionCoordinacion(Objects.toString(payload.getOrDefault("observacion", "Revisado por coordinación académica."), ""));
        return mapJustificacion(justificacionRepository.save(j));
    }

    // =========================================================================
    // 2. HORARIOS ESCOLARES SEMANALES CON VALIDACIÓN DE CONFLICTOS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarHorarios(String grupoCodigo, Long docenteId) {
        List<HorarioEscolar> lista;
        if (grupoCodigo != null && !grupoCodigo.isBlank() && !"TODOS".equalsIgnoreCase(grupoCodigo)) {
            lista = horarioRepository.findByGrupo_CodigoGrupoOrderByBloqueOrdenAsc(grupoCodigo.trim());
        } else if (docenteId != null) {
            lista = horarioRepository.findByDocente_IdOrderByBloqueOrdenAsc(docenteId);
            if (lista.isEmpty()) {
                lista = horarioRepository.findByDocente_Usuario_IdOrderByBloqueOrdenAsc(docenteId);
            }
        } else {
            lista = horarioRepository.findAll();
        }
        return lista.stream().map(this::mapHorario).toList();
    }

    @Transactional
    public Map<String, Object> crearBloqueHorario(Map<String, Object> payload) {
        AnioLectivo anio = anioLectivoRepository.findByActivoTrue()
                .orElseGet(() -> anioLectivoRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("No hay año lectivo activo.")));

        String grupoStr = Objects.toString(payload.getOrDefault("grupo", payload.getOrDefault("grupoCodigo", "10-A")), "10-A").trim();
        Grupo grupo = grupoRepository.findByCodigoGrupo(grupoStr)
                .orElseGet(() -> grupoRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("Grupo no encontrado: " + grupoStr)));

        String matStr = Objects.toString(payload.getOrDefault("materia", ""), "").trim();
        Materia materia = materiaRepository.findAll().stream()
                .filter(m -> m.getNombre().equalsIgnoreCase(matStr) || m.getCodigoOficial().equalsIgnoreCase(matStr))
                .findFirst()
                .orElseGet(() -> materiaRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("Materia no encontrada.")));

        String docStr = Objects.toString(payload.getOrDefault("docente", ""), "").trim().toLowerCase();
        Docente docente = docenteRepository.findAll().stream()
                .filter(d -> d.getUsuario() != null && d.getUsuario().getNombreCompleto().toLowerCase().contains(docStr))
                .findFirst()
                .orElseGet(() -> docenteRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("Docente no encontrado.")));

        String dia = Objects.toString(payload.getOrDefault("dia", payload.getOrDefault("diaSemana", "LUNES")), "LUNES")
                .trim().toUpperCase()
                .replace("Á", "A").replace("É", "E").replace("Í", "I").replace("Ó", "O").replace("Ú", "U");

        String horaStr = Objects.toString(payload.getOrDefault("hora", payload.getOrDefault("horaInicio", "07:00")), "07:00").trim();
        String inicioParte = horaStr.contains("-") ? horaStr.split("-")[0].trim() : horaStr;
        if (inicioParte.length() == 4) inicioParte = "0" + inicioParte;
        LocalTime horaInicio = LocalTime.parse(inicioParte.substring(0, 5));
        LocalTime horaFin = horaInicio.plusMinutes(60);

        int bloqueOrden = switch (horaInicio.getHour()) {
            case 7 -> 1;
            case 8 -> 2;
            case 9 -> 3;
            case 10 -> 4;
            case 11 -> 5;
            case 12 -> 6;
            default -> 7;
        };
        if (payload.get("bloqueOrden") != null) {
            try { bloqueOrden = Integer.parseInt(payload.get("bloqueOrden").toString()); } catch (NumberFormatException ignored) {}
        }

        if (horarioRepository.existsByAnioLectivo_IdAndGrupo_IdAndDiaSemanaAndBloqueOrden(anio.getId(), grupo.getId(), dia, bloqueOrden)) {
            throw new BusinessException("Conflicto de horario: el grupo " + grupo.getCodigoGrupo() + " ya tiene una clase asignada el " + dia + " en ese bloque horario.");
        }
        if (horarioRepository.existsByAnioLectivo_IdAndDocente_IdAndDiaSemanaAndBloqueOrden(anio.getId(), docente.getId(), dia, bloqueOrden)) {
            throw new BusinessException("Conflicto de horario: el docente " + docente.getUsuario().getNombreCompleto() + " ya dicta clase en otro grupo el " + dia + " en esa misma franja.");
        }

        String aula = Objects.toString(payload.getOrDefault("aula", grupo.getSalonAula()), "Aula 101").trim();

        HorarioEscolar bloque = HorarioEscolar.builder()
                .anioLectivo(anio)
                .grupo(grupo)
                .materia(materia)
                .docente(docente)
                .diaSemana(dia)
                .bloqueOrden(bloqueOrden)
                .horaInicio(horaInicio)
                .horaFin(horaFin)
                .aula(aula)
                .build();

        return mapHorario(horarioRepository.save(bloque));
    }

    @Transactional
    public void eliminarBloqueHorario(Long id) {
        horarioRepository.deleteById(id);
    }

    // =========================================================================
    // 3. COMUNICADOS INSTITUCIONALES, OBSERVADOR Y CITACIONES
    // =========================================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarComunicados() {
        return comunicadoRepository.findByActivoTrueOrderByFechaPublicacionDesc()
                .stream().map(this::mapComunicado).toList();
    }

    @Transactional
    public Map<String, Object> crearComunicado(Map<String, Object> payload, String emailAutor) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autor no encontrado."));
        String titulo = Objects.toString(payload.getOrDefault("titulo", ""), "").trim();
        String contenido = Objects.toString(payload.getOrDefault("contenido", payload.getOrDefault("mensaje", "")), "").trim();
        if (titulo.isBlank() || contenido.isBlank()) {
            throw new BusinessException("El título y el contenido del comunicado son obligatorios.");
        }
        String dest = Objects.toString(payload.getOrDefault("destinatarioRol", payload.getOrDefault("destinatarios", "TODOS")), "TODOS")
                .trim().toUpperCase().replace("ACUDIENTES", "TUTORES");
        if (!List.of("TODOS", "DOCENTES", "ESTUDIANTES", "TUTORES", "DIRECTIVOS").contains(dest)) {
            dest = "TODOS";
        }
        String imp = Objects.toString(payload.getOrDefault("importancia", payload.getOrDefault("prioridad", "NORMAL")), "NORMAL")
                .trim().toUpperCase();
        if (!List.of("BAJA", "NORMAL", "ALTA", "URGENTE").contains(imp)) {
            imp = "NORMAL";
        }

        Comunicado c = Comunicado.builder()
                .autor(autor)
                .titulo(titulo)
                .contenido(contenido)
                .destinatarioRol(dest)
                .importancia(imp)
                .fechaPublicacion(LocalDateTime.now())
                .activo(true)
                .build();
        return mapComunicado(comunicadoRepository.save(c));
    }

    @Transactional
    public void eliminarComunicado(Long id) {
        comunicadoRepository.findById(id).ifPresent(c -> {
            c.setActivo(false);
            comunicadoRepository.save(c);
        });
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarObservador(Long estudianteId, String emailSolicitante) {
        Usuario u = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (u.getRol() == Rol.ESTUDIANTE) {
            Estudiante miEst = estudianteRepository.findByUsuario_Id(u.getId())
                    .orElseThrow(() -> new ForbiddenAccessException("Perfil estudiantil no encontrado."));
            if (estudianteId != null && !estudianteId.equals(miEst.getId()) && !estudianteId.equals(u.getId())) {
                throw new ForbiddenAccessException("No puede consultar anotaciones del observador de otro estudiante.");
            }
            return observadorRepository.findByMatricula_Estudiante_IdOrderByFechaSucesoDesc(miEst.getId())
                    .stream().map(this::mapObservacion).toList();
        }

        List<ObservadorEstudiante> lista;
        if (estudianteId != null) {
            lista = observadorRepository.findByMatricula_Estudiante_IdOrderByFechaSucesoDesc(estudianteId);
            if (lista.isEmpty()) {
                lista = observadorRepository.findByMatricula_Estudiante_Usuario_IdOrderByFechaSucesoDesc(estudianteId);
            }
        } else {
            lista = observadorRepository.findAllByOrderByFechaSucesoDesc();
        }
        return lista.stream().map(this::mapObservacion).toList();
    }

    @Transactional
    public Map<String, Object> crearObservacion(Map<String, Object> payload, String emailAutor) {
        Usuario autor = usuarioRepository.findByEmail(emailAutor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        Matricula matricula = resolverMatricula(payload);
        PeriodoAcademico periodo = resolverPeriodoActivo(payload);

        String tipoRaw = Objects.toString(payload.getOrDefault("tipoAnotacion", payload.getOrDefault("tipo", "SEGUIMIENTO_ORIENTACION")), "SEGUIMIENTO_ORIENTACION")
                .trim().toUpperCase().replace(" ", "_");
        if (tipoRaw.contains("POSITIV") || tipoRaw.contains("FELICIT")) tipoRaw = "FELICITACION";
        else if (tipoRaw.contains("ATENCION") || tipoRaw.contains("DISCIPLIN")) tipoRaw = "LLAMADO_ATENCION";
        else if (tipoRaw.contains("ACADEMIC")) tipoRaw = "COMPROMISO_ACADEMICO";
        else if (tipoRaw.contains("CONVIVENCIA")) tipoRaw = "FALTA_CONVIVENCIA";
        else if (!List.of("FELICITACION", "LLAMADO_ATENCION", "COMPROMISO_ACADEMICO", "FALTA_CONVIVENCIA", "SEGUIMIENTO_ORIENTACION").contains(tipoRaw)) {
            tipoRaw = "SEGUIMIENTO_ORIENTACION";
        }

        String desc = Objects.toString(payload.getOrDefault("descripcionHechos", payload.getOrDefault("descripcion", "")), "").trim();
        if (desc.isBlank()) {
            throw new BusinessException("La descripción de la anotación en el observador es obligatoria.");
        }
        String compromisos = Objects.toString(payload.getOrDefault("compromisosAcordados", payload.getOrDefault("compromisos", "Seguimiento continuo de compromisos institucionales.")), "").trim();
        String descargos = Objects.toString(payload.getOrDefault("descargosEstudiante", payload.getOrDefault("descargos", "")), "");

        ObservadorEstudiante obs = ObservadorEstudiante.builder()
                .matricula(matricula)
                .autor(autor)
                .periodo(periodo)
                .fechaSuceso(LocalDate.now())
                .tipoAnotacion(tipoRaw)
                .categoriaFalta("FALTA_CONVIVENCIA".equals(tipoRaw) ? "TIPO_I" : "NO_APLICA")
                .descripcionHechos(desc)
                .descargosEstudiante(descargos)
                .compromisosAcordados(compromisos.isBlank() ? "Cumplir acuerdos pedagógicos." : compromisos)
                .firmadoEstudiante(false)
                .firmadoAcudiente(false)
                .build();

        return mapObservacion(observadorRepository.save(obs));
    }

    @Transactional
    public Map<String, Object> firmarObservacion(Long id, String emailFirmante) {
        Usuario u = usuarioRepository.findByEmail(emailFirmante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        ObservadorEstudiante obs = observadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anotación no encontrada."));
        if (u.getRol() == Rol.ESTUDIANTE) {
            obs.setFirmadoEstudiante(true);
        } else {
            obs.setFirmadoAcudiente(true);
        }
        return mapObservacion(observadorRepository.save(obs));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarCitaciones(String emailSolicitante) {
        Usuario u = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        List<CitacionPadre> lista = (u.getRol() == Rol.TUTOR)
                ? citacionRepository.findByTutor_Usuario_IdOrderByFechaHoraCitaDesc(u.getId())
                : citacionRepository.findAllByOrderByFechaHoraCitaDesc();
        return lista.stream().map(this::mapCitacion).toList();
    }

    @Transactional
    public Map<String, Object> crearCitacion(Map<String, Object> payload, String emailConvocante) {
        Usuario convocante = usuarioRepository.findByEmail(emailConvocante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        Matricula mat = resolverMatricula(payload);
        Estudiante est = mat.getEstudiante();

        Tutor tutor = estudianteTutorRepository.findByEstudiante_Id(est.getId()).stream()
                .map(EstudianteTutor::getTutor)
                .findFirst()
                .orElseGet(() -> tutorRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("No hay acudiente registrado para el estudiante.")));

        String motivo = Objects.toString(payload.getOrDefault("motivo", payload.getOrDefault("motivoCitacion", "")), "").trim();
        if (motivo.isBlank()) {
            throw new BusinessException("El motivo de la citación a acudiente es obligatorio.");
        }

        LocalDateTime fechaHora = LocalDateTime.now().plusDays(2).withHour(8).withMinute(30);
        if (payload.get("fecha") != null && !payload.get("fecha").toString().isBlank()) {
            try {
                LocalDate f = LocalDate.parse(payload.get("fecha").toString().substring(0, 10));
                LocalTime h = payload.get("hora") != null && !payload.get("hora").toString().isBlank()
                        ? LocalTime.parse(payload.get("hora").toString().substring(0, 5))
                        : LocalTime.of(8, 30);
                fechaHora = LocalDateTime.of(f, h);
            } catch (Exception ignored) {}
        }

        String modalidad = Objects.toString(payload.getOrDefault("modalidad", "PRESENCIAL"), "PRESENCIAL").trim().toUpperCase();
        if (!List.of("PRESENCIAL", "VIRTUAL", "TELEFONICA").contains(modalidad)) {
            modalidad = "PRESENCIAL";
        }

        CitacionPadre cit = CitacionPadre.builder()
                .estudiante(est)
                .tutor(tutor)
                .convocadoPor(convocante)
                .fechaHoraCita(fechaHora)
                .lugarOEnlace(Objects.toString(payload.getOrDefault("lugar", "Sala de Coordinación - Sede Principal"), "Sala de Coordinación - Sede Principal"))
                .motivoCitacion(motivo)
                .modalidad(modalidad)
                .estadoCita("PENDIENTE")
                .build();

        return mapCitacion(citacionRepository.save(cit));
    }

    @Transactional
    public Map<String, Object> actualizarEstadoCitacion(Long id, Map<String, Object> payload) {
        CitacionPadre cit = citacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Citación no encontrada."));
        String nuevoEstado = Objects.toString(payload.getOrDefault("estado", "CONFIRMADA_ACUDIENTE"), "CONFIRMADA_ACUDIENTE").toUpperCase();
        if (nuevoEstado.contains("CONFIRM")) nuevoEstado = "CONFIRMADA_ACUDIENTE";
        else if (nuevoEstado.contains("REALIZ") || nuevoEstado.contains("ASIST")) nuevoEstado = "REALIZADA";
        cit.setEstadoCita(nuevoEstado);
        if (payload.get("compromisosActa") != null) {
            cit.setCompromisosActa(payload.get("compromisosActa").toString());
        }
        return mapCitacion(citacionRepository.save(cit));
    }

    // =========================================================================
    // 4. BOLETÍN OFICIAL DECRETO 1290 VERIFICADO EN SERVIDOR
    // =========================================================================

    @Transactional(readOnly = true)
    public Map<String, Object> generarBoletinOficial(Long estudianteId, Integer numeroPeriodo, String emailSolicitante) {
        Usuario solicitante = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        Estudiante estudiante;
        if (solicitante.getRol() == Rol.ESTUDIANTE) {
            estudiante = estudianteRepository.findByUsuario_Id(solicitante.getId())
                    .orElseThrow(() -> new ForbiddenAccessException("Estudiante no encontrado."));
            if (estudianteId != null && !estudianteId.equals(estudiante.getId()) && !estudianteId.equals(solicitante.getId())) {
                throw new ForbiddenAccessException("Un estudiante únicamente puede generar su propio boletín oficial.");
            }
        } else if (estudianteId != null) {
            estudiante = estudianteRepository.findById(estudianteId)
                    .or(() -> estudianteRepository.findByUsuario_Id(estudianteId))
                    .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado."));
        } else {
            estudiante = estudianteRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No existen estudiantes registrados."));
        }

        Matricula matricula = matriculaRepository.findByEstudiante_Id(estudiante.getId()).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("El estudiante no tiene matrícula activa."));

        List<Calificacion> todasNotas = calificacionRepository.findByMatricula_Id(matricula.getId());
        if (numeroPeriodo != null) {
            todasNotas = todasNotas.stream()
                    .filter(c -> c.getPeriodo() != null && numeroPeriodo.equals(c.getPeriodo().getNumeroPeriodo()))
                    .toList();
        }

        List<Map<String, Object>> asignaturas = todasNotas.stream()
                .map(calificacionService::mapCalificacionToMap)
                .toList();

        double promedioGeneral = asignaturas.stream()
                .map(m -> (BigDecimal) m.get("notaDefinitivaPeriodo"))
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);
        BigDecimal promedioRedondeado = BigDecimal.valueOf(promedioGeneral).setScale(2, RoundingMode.HALF_UP);

        // Calcular puesto real del estudiante dentro de su grupo
        List<Matricula> matriculasGrupo = matriculaRepository.findByGrupo_Id(matricula.getGrupo().getId());
        List<Double> promediosGrupo = new ArrayList<>();
        for (Matricula mG : matriculasGrupo) {
            double avg = calificacionRepository.findByMatricula_Id(mG.getId()).stream()
                    .map(Calificacion::getNotaDefinitivaPeriodo)
                    .filter(Objects::nonNull)
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(0.0);
            promediosGrupo.add(avg);
        }
        promediosGrupo.sort(Comparator.reverseOrder());
        int puesto = 1;
        for (int i = 0; i < promediosGrupo.size(); i++) {
            if (Math.abs(promediosGrupo.get(i) - promedioGeneral) < 0.001) {
                puesto = i + 1;
                break;
            }
        }

        List<Asistencia> asistenciasEst = asistenciaRepository.findByMatricula_IdOrderByFechaClaseDesc(matricula.getId());
        long fallasInjustificadas = asistenciasEst.stream()
                .filter(a -> "AUSENTE".equalsIgnoreCase(a.getEstadoAsistencia()) && !Boolean.TRUE.equals(a.getJustificada()))
                .count();
        long fallasJustificadas = asistenciasEst.stream()
                .filter(a -> Boolean.TRUE.equals(a.getJustificada()))
                .count();

        String codigoVerificacion = generarHashVerificacion(matricula.getFolioMatricula(), promedioRedondeado.toString());

        Map<String, Object> boletin = new LinkedHashMap<>();
        boletin.put("folioMatricula", matricula.getFolioMatricula());
        boletin.put("estudianteId", estudiante.getId());
        boletin.put("estudianteNombre", estudiante.getUsuario().getNombreCompleto());
        boletin.put("documento", estudiante.getUsuario().getDocumento());
        boletin.put("codigoEstudiantil", estudiante.getCodigoEstudiantil());
        boletin.put("grupo", matricula.getGrupo().getCodigoGrupo());
        boletin.put("grado", matricula.getGrupo().getGrado() != null ? matricula.getGrupo().getGrado().getNombre() : "Décimo (10°)");
        boletin.put("jornada", matricula.getGrupo().getJornada());
        boletin.put("directorGrupo", matricula.getGrupo().getDirectorGrupo() != null && matricula.getGrupo().getDirectorGrupo().getUsuario() != null
                ? matricula.getGrupo().getDirectorGrupo().getUsuario().getNombreCompleto()
                : "Dirección de Grupo Institucional");
        boletin.put("anioLectivo", matricula.getAnioLectivo().getAnio());
        boletin.put("periodo", numeroPeriodo != null ? "Periodo " + numeroPeriodo : "Consolidado Académico");
        boletin.put("promedioGeneral", promedioRedondeado);
        boletin.put("escalaGlobal", calificacionService.determinarEscalaDesempeno(promedioRedondeado.setScale(1, RoundingMode.HALF_UP)));
        boletin.put("puestoCurso", puesto);
        boletin.put("totalEstudiantesCurso", matriculasGrupo.size());
        boletin.put("fallasInjustificadas", fallasInjustificadas);
        boletin.put("fallasJustificadas", fallasJustificadas);
        boletin.put("codigoVerificacion", codigoVerificacion);
        boletin.put("fechaEmision", LocalDate.now().toString());
        boletin.put("asignaturas", asignaturas);
        return boletin;
    }

    private String generarHashVerificacion(String folio, String promedio) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((folio + "-" + promedio + "-EDUCONNECT-DECRETO1290").getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < 6; i++) {
                hex.append(String.format("%02X", digest[i]));
            }
            return "VERIF-" + hex;
        } catch (Exception e) {
            return "VERIF-" + folio;
        }
    }

    // =========================================================================
    // HELPERS Y MAPPERS INTERNOS
    // =========================================================================

    private Matricula resolverMatricula(Map<String, Object> payload) {
        if (payload.get("matriculaId") != null) {
            return matriculaRepository.findById(Long.valueOf(payload.get("matriculaId").toString()))
                    .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada."));
        }
        if (payload.get("estudianteId") != null) {
            Long id = Long.valueOf(payload.get("estudianteId").toString());
            List<Matricula> mats = matriculaRepository.findByEstudiante_Id(id);
            if (mats.isEmpty()) mats = matriculaRepository.findByEstudiante_Usuario_Id(id);
            if (!mats.isEmpty()) return mats.get(0);
        }
        if (payload.get("estudiante") != null || payload.get("estudianteNombre") != null) {
            String nombre = Objects.toString(payload.getOrDefault("estudiante", payload.get("estudianteNombre")), "").trim().toLowerCase();
            Optional<Matricula> match = matriculaRepository.findAll().stream()
                    .filter(m -> m.getEstudiante() != null && m.getEstudiante().getUsuario() != null
                            && m.getEstudiante().getUsuario().getNombreCompleto().toLowerCase().contains(nombre))
                    .findFirst();
            if (match.isPresent()) return match.get();
        }
        return matriculaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("No se encontró matrícula activa para el estudiante."));
    }

    private CargaAcademica resolverCargaAcademica(Map<String, Object> payload, Grupo grupo, Usuario editor) {
        if (payload.get("cargaAcademicaId") != null) {
            return cargaAcademicaRepository.findById(Long.valueOf(payload.get("cargaAcademicaId").toString()))
                    .orElseThrow(() -> new ResourceNotFoundException("Carga académica no encontrada."));
        }
        if (payload.get("materiaId") != null && grupo != null) {
            Long matId = Long.valueOf(payload.get("materiaId").toString());
            Optional<CargaAcademica> c = cargaAcademicaRepository.findByGrupo_IdAndMateria_Id(grupo.getId(), matId);
            if (c.isPresent()) return c.get();
        }
        if (editor != null) {
            List<CargaAcademica> misCargas = cargaAcademicaRepository.findByDocente_Usuario_Id(editor.getId());
            if (!misCargas.isEmpty()) return misCargas.get(0);
        }
        if (grupo != null) {
            List<CargaAcademica> delGrupo = cargaAcademicaRepository.findByGrupo_Id(grupo.getId());
            if (!delGrupo.isEmpty()) return delGrupo.get(0);
        }
        return cargaAcademicaRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("No existe carga académica configurada."));
    }

    private PeriodoAcademico resolverPeriodoActivo(Map<String, Object> payload) {
        if (payload.get("periodoId") != null) {
            return periodoRepository.findById(Long.valueOf(payload.get("periodoId").toString()))
                    .orElseThrow(() -> new ResourceNotFoundException("Periodo no encontrado."));
        }
        return periodoRepository.findAllByOrderByNumeroPeriodoAsc().stream()
                .filter(p -> !Boolean.TRUE.equals(p.getCerrado()))
                .findFirst()
                .orElseGet(() -> periodoRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("No existen periodos académicos configurados.")));
    }

    public Map<String, Object> mapAsistencia(Asistencia a) {
        Usuario uEst = a.getMatricula() != null && a.getMatricula().getEstudiante() != null
                ? a.getMatricula().getEstudiante().getUsuario() : null;
        Materia mat = a.getCargaAcademica() != null ? a.getCargaAcademica().getMateria() : null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", a.getId());
        m.put("matriculaId", a.getMatricula() != null ? a.getMatricula().getId() : null);
        m.put("estudianteId", a.getMatricula() != null && a.getMatricula().getEstudiante() != null ? a.getMatricula().getEstudiante().getId() : null);
        m.put("estudianteNombre", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("estudiante", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("grupo", a.getMatricula() != null && a.getMatricula().getGrupo() != null ? a.getMatricula().getGrupo().getCodigoGrupo() : "");
        m.put("cargaAcademicaId", a.getCargaAcademica() != null ? a.getCargaAcademica().getId() : null);
        m.put("materiaId", mat != null ? mat.getId() : null);
        m.put("materia", mat != null ? mat.getNombre() : "");
        m.put("fecha", a.getFechaClase() != null ? a.getFechaClase().toString() : "");
        m.put("fechaClase", a.getFechaClase() != null ? a.getFechaClase().toString() : "");
        m.put("estado", a.getEstadoAsistencia());
        m.put("estadoAsistencia", a.getEstadoAsistencia());
        m.put("minutosRetraso", a.getMinutosRetraso());
        m.put("observacion", a.getObservacion());
        m.put("justificada", a.getJustificada());
        return m;
    }

    public Map<String, Object> mapJustificacion(JustificacionInasistencia j) {
        Asistencia a = j.getAsistencia();
        Usuario uEst = a != null && a.getMatricula() != null && a.getMatricula().getEstudiante() != null
                ? a.getMatricula().getEstudiante().getUsuario() : null;
        Usuario uTut = j.getTutor() != null ? j.getTutor().getUsuario() : null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", j.getId());
        m.put("asistenciaId", a != null ? a.getId() : null);
        m.put("estudiante", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("estudianteNombre", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("grupo", a != null && a.getMatricula() != null && a.getMatricula().getGrupo() != null ? a.getMatricula().getGrupo().getCodigoGrupo() : "");
        m.put("materia", a != null && a.getCargaAcademica() != null && a.getCargaAcademica().getMateria() != null ? a.getCargaAcademica().getMateria().getNombre() : "");
        m.put("fechaInasistencia", a != null && a.getFechaClase() != null ? a.getFechaClase().toString() : "");
        m.put("fecha", a != null && a.getFechaClase() != null ? a.getFechaClase().toString() : "");
        m.put("acudiente", uTut != null ? uTut.getNombreCompleto() : "");
        m.put("motivo", j.getMotivoExcusa());
        m.put("tipo", j.getTipoExcusa());
        m.put("soporte", j.getSoporteUrl());
        m.put("estado", j.getEstadoRevision());
        m.put("observacionCoordinacion", j.getObservacionCoordinacion());
        return m;
    }

    public Map<String, Object> mapHorario(HorarioEscolar h) {
        String hIni = h.getHoraInicio() != null ? h.getHoraInicio().toString().substring(0, 5) : "07:00";
        String hFin = h.getHoraFin() != null ? h.getHoraFin().toString().substring(0, 5) : "08:00";
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", h.getId());
        m.put("grupoId", h.getGrupo() != null ? h.getGrupo().getId() : null);
        m.put("grupo", h.getGrupo() != null ? h.getGrupo().getCodigoGrupo() : "");
        m.put("materiaId", h.getMateria() != null ? h.getMateria().getId() : null);
        m.put("materia", h.getMateria() != null ? h.getMateria().getNombre() : "");
        m.put("docenteId", h.getDocente() != null ? h.getDocente().getId() : null);
        m.put("docente", h.getDocente() != null && h.getDocente().getUsuario() != null ? h.getDocente().getUsuario().getNombreCompleto() : "");
        m.put("dia", h.getDiaSemana());
        m.put("diaSemana", h.getDiaSemana());
        m.put("bloqueOrden", h.getBloqueOrden());
        m.put("horaInicio", hIni);
        m.put("horaFin", hFin);
        m.put("hora", hIni + " - " + hFin);
        m.put("aula", h.getAula());
        return m;
    }

    public Map<String, Object> mapComunicado(Comunicado c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("titulo", c.getTitulo());
        m.put("contenido", c.getContenido());
        m.put("mensaje", c.getContenido());
        m.put("autor", c.getAutor() != null ? c.getAutor().getNombreCompleto() : "Administración Institucional");
        m.put("rolAutor", c.getAutor() != null ? c.getAutor().getRol().name() : "ADMIN");
        m.put("destinatarios", c.getDestinatarioRol());
        m.put("destinatarioRol", c.getDestinatarioRol());
        m.put("prioridad", c.getImportancia());
        m.put("importancia", c.getImportancia());
        m.put("fecha", c.getFechaPublicacion() != null ? c.getFechaPublicacion().toLocalDate().toString() : LocalDate.now().toString());
        return m;
    }

    public Map<String, Object> mapObservacion(ObservadorEstudiante o) {
        Usuario uEst = o.getMatricula() != null && o.getMatricula().getEstudiante() != null
                ? o.getMatricula().getEstudiante().getUsuario() : null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("matriculaId", o.getMatricula() != null ? o.getMatricula().getId() : null);
        m.put("estudianteId", o.getMatricula() != null && o.getMatricula().getEstudiante() != null ? o.getMatricula().getEstudiante().getId() : null);
        m.put("estudiante", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("estudianteNombre", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("grupo", o.getMatricula() != null && o.getMatricula().getGrupo() != null ? o.getMatricula().getGrupo().getCodigoGrupo() : "");
        m.put("autor", o.getAutor() != null ? o.getAutor().getNombreCompleto() : "");
        m.put("periodo", o.getPeriodo() != null ? o.getPeriodo().getNombre() : "Periodo 1");
        m.put("fecha", o.getFechaSuceso() != null ? o.getFechaSuceso().toString() : "");
        m.put("tipo", o.getTipoAnotacion());
        m.put("tipoAnotacion", o.getTipoAnotacion());
        m.put("categoriaFalta", o.getCategoriaFalta());
        m.put("descripcion", o.getDescripcionHechos());
        m.put("descripcionHechos", o.getDescripcionHechos());
        m.put("descargos", o.getDescargosEstudiante());
        m.put("compromisos", o.getCompromisosAcordados());
        m.put("firmadoEstudiante", o.getFirmadoEstudiante());
        m.put("firmadoAcudiente", o.getFirmadoAcudiente());
        return m;
    }

    public Map<String, Object> mapCitacion(CitacionPadre c) {
        Usuario uEst = c.getEstudiante() != null ? c.getEstudiante().getUsuario() : null;
        Usuario uTut = c.getTutor() != null ? c.getTutor().getUsuario() : null;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("estudianteId", c.getEstudiante() != null ? c.getEstudiante().getId() : null);
        m.put("estudiante", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("estudianteNombre", uEst != null ? uEst.getNombreCompleto() : "");
        m.put("acudiente", uTut != null ? uTut.getNombreCompleto() : "");
        m.put("convocadoPor", c.getConvocadoPor() != null ? c.getConvocadoPor().getNombreCompleto() : "");
        m.put("docente", c.getConvocadoPor() != null ? c.getConvocadoPor().getNombreCompleto() : "");
        m.put("fecha", c.getFechaHoraCita() != null ? c.getFechaHoraCita().toLocalDate().toString() : "");
        m.put("hora", c.getFechaHoraCita() != null ? c.getFechaHoraCita().toLocalTime().toString().substring(0, 5) : "08:30");
        m.put("lugar", c.getLugarOEnlace());
        m.put("motivo", c.getMotivoCitacion());
        m.put("modalidad", c.getModalidad());
        m.put("estado", c.getEstadoCita());
        m.put("compromisosActa", c.getCompromisosActa());
        return m;
    }
}
