package com.educonnect.service;

import com.educonnect.dto.DashboardStatsDto;
import com.educonnect.dto.UsuarioCreateUpdateDto;
import com.educonnect.dto.UsuarioResponseDto;
import com.educonnect.exception.BusinessException;
import com.educonnect.exception.ResourceNotFoundException;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final TutorRepository tutorRepository;
    private final EstudianteTutorRepository estudianteTutorRepository;
    private final GrupoRepository grupoRepository;
    private final GradoRepository gradoRepository;
    private final MateriaRepository materiaRepository;
    private final CargaAcademicaRepository cargaAcademicaRepository;
    private final MatriculaRepository matriculaRepository;
    private final AnioLectivoRepository anioLectivoRepository;
    private final PeriodoAcademicoRepository periodoAcademicoRepository;
    private final CalificacionRepository calificacionRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final BitacoraMipaRepository bitacoraMipaRepository;
    private final SolicitudModificacionNotaRepository solicitudNotaRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public DashboardStatsDto obtenerEstadisticasGenerales() {
        List<Calificacion> calificaciones = calificacionRepository.findAll();
        double promedioInst = 4.2;
        if (!calificaciones.isEmpty()) {
            double suma = calificaciones.stream()
                    .map(Calificacion::getNotaDefinitivaPeriodo)
                    .filter(Objects::nonNull)
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(4.2);
            promedioInst = BigDecimal.valueOf(suma).setScale(2, RoundingMode.HALF_UP).doubleValue();
        }

        List<Asistencia> asistencias = asistenciaRepository.findAll();
        double porcentajeAsist = 96.4;
        if (!asistencias.isEmpty()) {
            long presentes = asistencias.stream()
                    .filter(a -> "PRESENTE".equalsIgnoreCase(a.getEstadoAsistencia()) || Boolean.TRUE.equals(a.getJustificada()))
                    .count();
            porcentajeAsist = BigDecimal.valueOf((presentes * 100.0) / asistencias.size())
                    .setScale(1, RoundingMode.HALF_UP).doubleValue();
        }

        long alertasRiesgo = bitacoraMipaRepository.findAll().stream()
                .filter(b -> ("CRITICO".equalsIgnoreCase(b.getNivelAlerta()) || "ALTO".equalsIgnoreCase(b.getNivelAlerta()))
                        && !Boolean.TRUE.equals(b.getAtendidoOrientacion()))
                .count();

        long solicitudesPend = solicitudNotaRepository.findByEstadoOrderByFechaSolicitudDesc("PENDIENTE").size();

        return DashboardStatsDto.builder()
                .totalEstudiantes(estudianteRepository.count())
                .totalDocentes(docenteRepository.count())
                .totalGrupos(grupoRepository.count())
                .totalMaterias(materiaRepository.count())
                .totalUsuarios(usuarioRepository.count())
                .totalTutores(tutorRepository.count())
                .promedioInstitucional(promedioInst)
                .porcentajeAsistencia(porcentajeAsist)
                .alertasRiesgo(alertasRiesgo)
                .solicitudesPendientes(solicitudesPend)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listarTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<Matricula> matriculas = matriculaRepository.findAll();
        List<Docente> docentes = docenteRepository.findAll();

        Map<Long, Matricula> matriculaPorUsuario = new HashMap<>();
        for (Matricula m : matriculas) {
            if (m.getEstudiante() != null && m.getEstudiante().getUsuario() != null) {
                matriculaPorUsuario.put(m.getEstudiante().getUsuario().getId(), m);
            }
        }

        Map<Long, Docente> docentePorUsuario = new HashMap<>();
        for (Docente d : docentes) {
            if (d.getUsuario() != null) {
                docentePorUsuario.put(d.getUsuario().getId(), d);
            }
        }

        return usuarios.stream().map(u -> mapUsuarioToDto(u, matriculaPorUsuario.get(u.getId()), docentePorUsuario.get(u.getId()))).toList();
    }

    public UsuarioResponseDto mapUsuarioToDto(Usuario u, Matricula mat, Docente doc) {
        String grupoCodigo = mat != null && mat.getGrupo() != null ? mat.getGrupo().getCodigoGrupo() : null;
        Long grupoId = mat != null && mat.getGrupo() != null ? mat.getGrupo().getId() : null;
        String especialidad = doc != null ? doc.getEspecialidad() : null;

        String nombre = u.getPrimerNombre() + (u.getSegundoNombre() != null && !u.getSegundoNombre().isBlank() ? " " + u.getSegundoNombre() : "");
        String apellido = u.getPrimerApellido() + (u.getSegundoApellido() != null && !u.getSegundoApellido().isBlank() ? " " + u.getSegundoApellido() : "");

        return UsuarioResponseDto.builder()
                .id(u.getId())
                .tipoDocumento(u.getTipoDocumento())
                .documento(u.getDocumento())
                .email(u.getEmail())
                .rol(u.getRol())
                .primerNombre(u.getPrimerNombre())
                .segundoNombre(u.getSegundoNombre())
                .primerApellido(u.getPrimerApellido())
                .segundoApellido(u.getSegundoApellido())
                .nombre(nombre.trim())
                .apellido(apellido.trim())
                .nombreCompleto(u.getNombreCompleto())
                .telefono(u.getTelefono())
                .direccion(u.getDireccion())
                .estado(u.getEstado())
                .grupo(grupoCodigo)
                .grupoId(grupoId)
                .especialidad(especialidad)
                .ultimoAcceso(u.getUltimoAcceso())
                .fechaCreacion(u.getFechaCreacion())
                .build();
    }

    @Transactional
    public UsuarioResponseDto crearUsuario(UsuarioCreateUpdateDto dto) {
        String emailClean = dto.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(emailClean)) {
            throw new BusinessException("El correo electrónico ya está registrado en la plataforma.");
        }
        if (usuarioRepository.existsByDocumento(dto.getDocumento().trim())) {
            throw new BusinessException("El número de documento ya está registrado en la plataforma.");
        }

        Rol rol = parseRol(dto.getRol());
        String primerNombre = dto.getPrimerNombre();
        String segundoNombre = dto.getSegundoNombre();
        if ((primerNombre == null || primerNombre.isBlank()) && dto.getNombre() != null) {
            String[] parts = dto.getNombre().trim().split("\\s+", 2);
            primerNombre = parts[0];
            if (parts.length > 1) segundoNombre = parts[1];
        }
        if (primerNombre == null || primerNombre.isBlank()) {
            throw new BusinessException("El nombre del usuario es obligatorio.");
        }

        String primerApellido = dto.getPrimerApellido();
        String segundoApellido = dto.getSegundoApellido();
        if ((primerApellido == null || primerApellido.isBlank()) && dto.getApellido() != null) {
            String[] parts = dto.getApellido().trim().split("\\s+", 2);
            primerApellido = parts[0];
            if (parts.length > 1) segundoApellido = parts[1];
        }
        if (primerApellido == null || primerApellido.isBlank()) {
            primerApellido = "Institucional";
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BusinessException("La contraseña inicial es obligatoria.");
        }
        String rawPassword = dto.getPassword().trim();

        Usuario usuario = Usuario.builder()
                .tipoDocumento(dto.getTipoDocumento() != null && !dto.getTipoDocumento().isBlank() ? dto.getTipoDocumento().toUpperCase() : "CC")
                .documento(dto.getDocumento().trim())
                .email(emailClean)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .rol(rol)
                .primerNombre(primerNombre.trim())
                .segundoNombre(segundoNombre)
                .primerApellido(primerApellido.trim())
                .segundoApellido(segundoApellido)
                .telefono(dto.getTelefono())
                .direccion(dto.getDireccion())
                .estado(dto.getEstado() != null ? dto.getEstado() : true)
                .intentosFallidos(0)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);
        Matricula matriculaCreada = null;
        Docente docenteCreado = null;

        if (rol == Rol.DOCENTE || rol == Rol.DIRECTOR_GRUPO) {
            docenteCreado = docenteRepository.save(Docente.builder()
                    .usuario(guardado)
                    .codigoEmpleado("DOC-" + guardado.getDocumento())
                    .especialidad(dto.getEspecialidad() != null && !dto.getEspecialidad().isBlank() ? dto.getEspecialidad() : "Ciencias y Pedagogía")
                    .tituloProfesional(dto.getTituloProfesional() != null && !dto.getTituloProfesional().isBlank() ? dto.getTituloProfesional() : "Licenciado en Educación")
                    .fechaVinculacion(LocalDate.now())
                    .activo(true)
                    .build());
        } else if (rol == Rol.ESTUDIANTE) {
            Estudiante est = estudianteRepository.save(Estudiante.builder()
                    .usuario(guardado)
                    .codigoEstudiantil("EST-" + guardado.getDocumento())
                    .fechaNacimiento(LocalDate.of(2009, 5, 15))
                    .genero("OTRO")
                    .rhGrupoSanguineo("O+")
                    .eps("Sura EPS")
                    .estrato(3)
                    .estadoAcademico("ACTIVO")
                    .build());

            Grupo grupoDestino = resolverGrupo(dto.getGrupoId(), dto.getGrupoCodigo());
            if (grupoDestino != null) {
                AnioLectivo anio = grupoDestino.getAnioLectivo();
                matriculaCreada = matriculaRepository.save(Matricula.builder()
                        .folioMatricula("MAT-" + anio.getAnio() + "-" + est.getId())
                        .estudiante(est)
                        .grupo(grupoDestino)
                        .anioLectivo(anio)
                        .pazYSalvo(true)
                        .estadoMatricula("ACTIVA")
                        .build());
            }
        } else if (rol == Rol.TUTOR) {
            Tutor tutor = tutorRepository.save(Tutor.builder()
                    .usuario(guardado)
                    .ocupacion("Acudiente Registrado")
                    .telefonoEmergencia(guardado.getTelefono() != null ? guardado.getTelefono() : "3000000000")
                    .autorizadoRecoger(true)
                    .build());

            if (dto.getEstudianteAcudidoId() != null) {
                estudianteRepository.findById(dto.getEstudianteAcudidoId()).ifPresent(est -> {
                    estudianteTutorRepository.save(EstudianteTutor.builder()
                            .estudiante(est)
                            .tutor(tutor)
                            .parentesco(dto.getParentesco() != null ? dto.getParentesco().toUpperCase() : "ACUDIENTE_LEGAL")
                            .esAcudientePrincipal(true)
                            .build());
                });
            }
        }

        emailService.enviarNotificacionBienvenida(guardado.getEmail(), guardado.getNombreCompleto(), guardado.getRol().name());
        return mapUsuarioToDto(guardado, matriculaCreada, docenteCreado);
    }

    @Transactional
    public UsuarioResponseDto actualizarUsuario(Long id, UsuarioCreateUpdateDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String emailClean = dto.getEmail().trim().toLowerCase();
            if (!emailClean.equalsIgnoreCase(usuario.getEmail()) && usuarioRepository.existsByEmail(emailClean)) {
                throw new BusinessException("El correo electrónico ya está en uso por otro usuario.");
            }
            usuario.setEmail(emailClean);
        }
        if (dto.getDocumento() != null && !dto.getDocumento().isBlank()) {
            String docClean = dto.getDocumento().trim();
            if (!docClean.equals(usuario.getDocumento()) && usuarioRepository.existsByDocumento(docClean)) {
                throw new BusinessException("El documento ya está registrado por otro usuario.");
            }
            usuario.setDocumento(docClean);
        }
        if (dto.getRol() != null && !dto.getRol().isBlank()) {
            usuario.setRol(parseRol(dto.getRol()));
        }
        if (dto.getPrimerNombre() != null && !dto.getPrimerNombre().isBlank()) {
            usuario.setPrimerNombre(dto.getPrimerNombre().trim());
        } else if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            String[] parts = dto.getNombre().trim().split("\\s+", 2);
            usuario.setPrimerNombre(parts[0]);
            usuario.setSegundoNombre(parts.length > 1 ? parts[1] : null);
        }
        if (dto.getPrimerApellido() != null && !dto.getPrimerApellido().isBlank()) {
            usuario.setPrimerApellido(dto.getPrimerApellido().trim());
        } else if (dto.getApellido() != null && !dto.getApellido().isBlank()) {
            String[] parts = dto.getApellido().trim().split("\\s+", 2);
            usuario.setPrimerApellido(parts[0]);
            usuario.setSegundoApellido(parts.length > 1 ? parts[1] : null);
        }
        if (dto.getTelefono() != null) usuario.setTelefono(dto.getTelefono());
        if (dto.getDireccion() != null) usuario.setDireccion(dto.getDireccion());
        if (dto.getEstado() != null) {
            usuario.setEstado(dto.getEstado());
            if (Boolean.TRUE.equals(dto.getEstado())) {
                usuario.setIntentosFallidos(0);
            }
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword().trim()));
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        Matricula mat = null;
        Optional<Estudiante> estOpt = estudianteRepository.findByUsuario_Id(actualizado.getId());
        if (estOpt.isPresent()) {
            List<Matricula> mats = matriculaRepository.findByEstudiante_Id(estOpt.get().getId());
            if (!mats.isEmpty()) {
                mat = mats.get(0);
                Grupo nuevoGrupo = resolverGrupo(dto.getGrupoId(), dto.getGrupoCodigo());
                if (nuevoGrupo != null) {
                    mat.setGrupo(nuevoGrupo);
                    mat = matriculaRepository.save(mat);
                }
            }
        }
        Docente doc = docenteRepository.findByUsuario_Id(actualizado.getId()).orElse(null);
        return mapUsuarioToDto(actualizado, mat, doc);
    }

    @Transactional
    public Map<String, Object> cambiarEstadoOBajaLogicaUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        usuario.setEstado(!Boolean.TRUE.equals(usuario.getEstado()));
        usuarioRepository.save(usuario);
        return Map.of(
                "id", usuario.getId(),
                "estado", usuario.getEstado(),
                "mensaje", usuario.getEstado() ? "Usuario reactivado correctamente." : "Usuario desactivado (baja lógica por integridad académica)."
        );
    }

    private Grupo resolverGrupo(Long grupoId, String grupoCodigo) {
        if (grupoId != null) {
            return grupoRepository.findById(grupoId).orElse(null);
        }
        if (grupoCodigo != null && !grupoCodigo.isBlank()) {
            return grupoRepository.findByCodigoGrupo(grupoCodigo.trim()).orElse(null);
        }
        return grupoRepository.findAll().stream().findFirst().orElse(null);
    }

    private Rol parseRol(String rawRol) {
        if (rawRol == null || rawRol.isBlank()) return Rol.ESTUDIANTE;
        String norm = rawRol.trim().toUpperCase()
                .replace("ACUDIENTE", "TUTOR")
                .replace("ESTUDIANTES", "ESTUDIANTE")
                .replace("DOCENTES", "DOCENTE");
        try {
            return Rol.valueOf(norm);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Rol institucional inválido: " + rawRol);
        }
    }

    // --- GESTIÓN DE GRUPOS ---
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarGruposConDetalle() {
        List<Grupo> grupos = grupoRepository.findAll();
        List<Matricula> matriculas = matriculaRepository.findAll();

        return grupos.stream().map(g -> {
            long totalEst = matriculas.stream()
                    .filter(m -> m.getGrupo() != null && g.getId().equals(m.getGrupo().getId()) && "ACTIVA".equalsIgnoreCase(m.getEstadoMatricula()))
                    .count();
            String directorNombre = g.getDirectorGrupo() != null && g.getDirectorGrupo().getUsuario() != null
                    ? g.getDirectorGrupo().getUsuario().getNombreCompleto()
                    : "Sin asignar";
            Long directorId = g.getDirectorGrupo() != null ? g.getDirectorGrupo().getId() : null;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", g.getId());
            item.put("nombre", g.getCodigoGrupo());
            item.put("codigoGrupo", g.getCodigoGrupo());
            item.put("grado", g.getGrado() != null ? g.getGrado().getNombre() : "");
            item.put("gradoId", g.getGrado() != null ? g.getGrado().getId() : null);
            item.put("nivel", g.getGrado() != null ? g.getGrado().getNivel() : "MEDIA_VOCACIONAL");
            item.put("director", directorNombre);
            item.put("directorNombre", directorNombre);
            item.put("directorGrupoId", directorId);
            item.put("salon", g.getSalonAula());
            item.put("salonAula", g.getSalonAula());
            item.put("jornada", g.getJornada());
            item.put("cupoMaximo", g.getCupoMaximo());
            item.put("estudiantes", totalEst);
            item.put("totalEstudiantes", totalEst);
            item.put("anioLectivo", g.getAnioLectivo() != null ? g.getAnioLectivo().getAnio() : 2025);
            return item;
        }).toList();
    }

    @Transactional
    public Map<String, Object> crearOActualizarGrupo(Long grupoId, Map<String, Object> payload) {
        String codigo = Objects.toString(payload.getOrDefault("codigoGrupo", payload.getOrDefault("nombre", "")), "").trim();
        if (codigo.isBlank()) {
            throw new BusinessException("El código o nombre del grupo es obligatorio (ej. 10-A).");
        }

        AnioLectivo anioActivo = anioLectivoRepository.findByActivoTrue()
                .orElseGet(() -> anioLectivoRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BusinessException("No existe un año lectivo activo configurado.")));

        Grado grado = null;
        if (payload.get("gradoId") != null) {
            Long gId = Long.valueOf(payload.get("gradoId").toString());
            grado = gradoRepository.findById(gId).orElse(null);
        }
        if (grado == null && payload.get("grado") != null) {
            String nombreGrado = payload.get("grado").toString().trim();
            grado = gradoRepository.findByNombre(nombreGrado).orElse(null);
        }
        if (grado == null) {
            grado = gradoRepository.findAll().stream().findFirst()
                    .orElseGet(() -> gradoRepository.save(Grado.builder()
                            .nombre("Décimo (10°)")
                            .nivel("MEDIA_VOCACIONAL")
                            .numeroOrden(10)
                            .build()));
        }

        Docente director = null;
        Object dirObj = payload.getOrDefault("directorGrupoId", payload.get("directorId"));
        if (dirObj != null && !dirObj.toString().isBlank()) {
            try {
                Long docId = Long.valueOf(dirObj.toString());
                director = docenteRepository.findById(docId)
                        .or(() -> docenteRepository.findByUsuario_Id(docId))
                        .orElse(null);
            } catch (NumberFormatException ignored) {}
        }
        if (director == null && payload.get("director") != null) {
            String dirName = payload.get("director").toString().trim().toLowerCase();
            director = docenteRepository.findAll().stream()
                    .filter(d -> d.getUsuario() != null && d.getUsuario().getNombreCompleto().toLowerCase().contains(dirName))
                    .findFirst().orElse(null);
        }

        String salon = Objects.toString(payload.getOrDefault("salonAula", payload.getOrDefault("salon", "Aula 101")), "Aula 101").trim();
        String jornada = Objects.toString(payload.getOrDefault("jornada", "MAÑANA"), "MAÑANA").trim().toUpperCase();
        int cupo = 35;
        if (payload.get("cupoMaximo") != null) {
            try { cupo = Integer.parseInt(payload.get("cupoMaximo").toString()); } catch (NumberFormatException ignored) {}
        }

        Grupo grupo;
        if (grupoId != null) {
            grupo = grupoRepository.findById(grupoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado con ID: " + grupoId));
        } else {
            grupo = grupoRepository.findByCodigoGrupo(codigo).orElse(new Grupo());
            grupo.setAnioLectivo(anioActivo);
        }

        grupo.setCodigoGrupo(codigo);
        grupo.setGrado(grado);
        grupo.setDirectorGrupo(director);
        grupo.setSalonAula(salon);
        grupo.setJornada(jornada);
        grupo.setCupoMaximo(cupo);

        Grupo guardado = grupoRepository.save(grupo);
        return listarGruposConDetalle().stream()
                .filter(m -> guardado.getId().equals(m.get("id")))
                .findFirst()
                .orElse(Map.of("id", guardado.getId(), "codigoGrupo", guardado.getCodigoGrupo()));
    }

    @Transactional
    public void eliminarGrupo(Long grupoId) {
        Grupo grupo = grupoRepository.findById(grupoId)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado."));
        if (!matriculaRepository.findByGrupo_Id(grupoId).isEmpty()) {
            throw new BusinessException("No se puede eliminar un grupo que tiene estudiantes matriculados activos.");
        }
        grupoRepository.delete(grupo);
    }

    // --- GESTIÓN DE MATERIAS ---
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarMaterias() {
        List<Materia> materias = materiaRepository.findAll();
        List<CargaAcademica> cargas = cargaAcademicaRepository.findAll();

        return materias.stream().map(m -> {
            List<CargaAcademica> cargasMateria = cargas.stream()
                    .filter(c -> c.getMateria() != null && m.getId().equals(c.getMateria().getId()))
                    .toList();
            String docentePrincipal = cargasMateria.stream()
                    .filter(c -> c.getDocente() != null && c.getDocente().getUsuario() != null)
                    .map(c -> c.getDocente().getUsuario().getNombreCompleto())
                    .findFirst().orElse("Sin asignar");
            String gruposAsignados = String.join(", ", cargasMateria.stream()
                    .filter(c -> c.getGrupo() != null)
                    .map(c -> c.getGrupo().getCodigoGrupo())
                    .distinct().toList());

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("codigo", m.getCodigoOficial());
            map.put("codigoOficial", m.getCodigoOficial());
            map.put("nombre", m.getNombre());
            map.put("area", m.getAreaConocimiento());
            map.put("areaConocimiento", m.getAreaConocimiento());
            map.put("intensidadHoraria", m.getHorasSemanales());
            map.put("horasSemanales", m.getHorasSemanales());
            map.put("descripcion", m.getDescripcion());
            map.put("activa", m.getActiva());
            map.put("docente", docentePrincipal);
            map.put("grupos", gruposAsignados.isEmpty() ? "Sin grupos" : gruposAsignados);
            return map;
        }).toList();
    }

    @Transactional
    public Map<String, Object> crearOActualizarMateria(Long id, Map<String, Object> payload) {
        String nombre = Objects.toString(payload.getOrDefault("nombre", ""), "").trim();
        if (nombre.isBlank()) {
            throw new BusinessException("El nombre de la asignatura es obligatorio.");
        }
        String codigo = Objects.toString(payload.getOrDefault("codigoOficial", payload.getOrDefault("codigo", "")), "").trim();
        if (codigo.isBlank()) {
            codigo = nombre.substring(0, Math.min(3, nombre.length())).toUpperCase() + "-" + (100 + materiaRepository.count());
        }
        String area = Objects.toString(payload.getOrDefault("areaConocimiento", payload.getOrDefault("area", "Ciencias Básicas")), "Ciencias Básicas").trim();
        int horas = 4;
        Object hObj = payload.getOrDefault("horasSemanales", payload.get("intensidadHoraria"));
        if (hObj != null) {
            try { horas = Integer.parseInt(hObj.toString()); } catch (NumberFormatException ignored) {}
        }
        String desc = Objects.toString(payload.getOrDefault("descripcion", "Asignatura oficial del plan de estudios institucional"), "");

        Materia materia = id != null
                ? materiaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Materia no encontrada."))
                : new Materia();

        materia.setCodigoOficial(codigo.toUpperCase());
        materia.setNombre(nombre);
        materia.setAreaConocimiento(area);
        materia.setHorasSemanales(horas);
        materia.setDescripcion(desc);
        materia.setActiva(true);

        Materia guardada = materiaRepository.save(materia);
        return listarMaterias().stream()
                .filter(m -> guardada.getId().equals(m.get("id")))
                .findFirst()
                .orElse(Map.of("id", guardada.getId(), "nombre", guardada.getNombre()));
    }

    // --- GESTIÓN DE CARGA ACADÉMICA ---
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarCargasAcademicas() {
        return cargaAcademicaRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("grupoId", c.getGrupo() != null ? c.getGrupo().getId() : null);
            map.put("grupo", c.getGrupo() != null ? c.getGrupo().getCodigoGrupo() : "");
            map.put("materiaId", c.getMateria() != null ? c.getMateria().getId() : null);
            map.put("materia", c.getMateria() != null ? c.getMateria().getNombre() : "");
            map.put("area", c.getMateria() != null ? c.getMateria().getAreaConocimiento() : "");
            map.put("docenteId", c.getDocente() != null ? c.getDocente().getId() : null);
            map.put("docenteUsuarioId", c.getDocente() != null && c.getDocente().getUsuario() != null ? c.getDocente().getUsuario().getId() : null);
            map.put("docente", c.getDocente() != null && c.getDocente().getUsuario() != null ? c.getDocente().getUsuario().getNombreCompleto() : "");
            map.put("intensidadHoraria", c.getIntensidadHoraria());
            return map;
        }).toList();
    }

    @Transactional
    public Map<String, Object> asignarCargaAcademica(Map<String, Object> payload) {
        Grupo grupo = null;
        if (payload.get("grupoId") != null) {
            grupo = grupoRepository.findById(Long.valueOf(payload.get("grupoId").toString())).orElse(null);
        }
        if (grupo == null && payload.get("grupo") != null) {
            grupo = grupoRepository.findByCodigoGrupo(payload.get("grupo").toString().trim()).orElse(null);
        }
        if (grupo == null) {
            throw new BusinessException("Debe seleccionar un grupo válido para asignar la carga académica.");
        }

        Materia materia = null;
        if (payload.get("materiaId") != null) {
            materia = materiaRepository.findById(Long.valueOf(payload.get("materiaId").toString())).orElse(null);
        }
        if (materia == null && payload.get("materia") != null) {
            String matName = payload.get("materia").toString().trim();
            materia = materiaRepository.findAll().stream()
                    .filter(m -> m.getNombre().equalsIgnoreCase(matName) || m.getCodigoOficial().equalsIgnoreCase(matName))
                    .findFirst().orElse(null);
        }
        if (materia == null) {
            throw new BusinessException("Debe seleccionar una materia válida.");
        }

        Docente docente = null;
        if (payload.get("docenteUsuarioId") != null) {
            Long usuarioId = Long.valueOf(payload.get("docenteUsuarioId").toString());
            docente = docenteRepository.findByUsuario_Id(usuarioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado."));
        } else if (payload.get("docenteId") != null) {
            Long dId = Long.valueOf(payload.get("docenteId").toString());
            docente = docenteRepository.findById(dId)
                    .or(() -> docenteRepository.findByUsuario_Id(dId))
                    .orElse(null);
        }
        if (docente == null && payload.get("docente") != null) {
            String docName = payload.get("docente").toString().trim().toLowerCase();
            docente = docenteRepository.findAll().stream()
                    .filter(d -> d.getUsuario() != null && d.getUsuario().getNombreCompleto().toLowerCase().contains(docName))
                    .findFirst().orElse(null);
        }
        if (docente == null) {
            throw new BusinessException("Debe seleccionar un docente válido.");
        }

        int horas = materia.getHorasSemanales() != null ? materia.getHorasSemanales() : 4;
        if (payload.get("intensidadHoraria") != null) {
            try { horas = Integer.parseInt(payload.get("intensidadHoraria").toString()); } catch (NumberFormatException ignored) {}
        }

        CargaAcademica carga = cargaAcademicaRepository.findByGrupo_IdAndMateria_Id(grupo.getId(), materia.getId())
                .orElse(new CargaAcademica());
        carga.setGrupo(grupo);
        carga.setMateria(materia);
        carga.setDocente(docente);
        carga.setIntensidadHoraria(horas);

        CargaAcademica guardada = cargaAcademicaRepository.save(carga);
        return listarCargasAcademicas().stream()
                .filter(c -> guardada.getId().equals(c.get("id")))
                .findFirst()
                .orElse(Map.of("id", guardada.getId()));
    }

    @Transactional
    public void eliminarCargaAcademica(Long id) {
        cargaAcademicaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarPeriodosAcademicos() {
        return periodoAcademicoRepository.findAllByOrderByNumeroPeriodoAsc().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("numeroPeriodo", p.getNumeroPeriodo());
            m.put("nombre", p.getNombre());
            m.put("porcentajeValor", p.getPorcentajeValor());
            m.put("fechaInicio", p.getFechaInicio());
            m.put("fechaFin", p.getFechaFin());
            m.put("fechaCierreNotas", p.getFechaCierreNotas());
            m.put("cerrado", p.getCerrado());
            return m;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Grado> listarGrados() {
        return gradoRepository.findAll();
    }
}
