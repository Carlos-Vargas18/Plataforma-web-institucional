package com.educonnect.service;

import com.educonnect.dto.*;
import com.educonnect.exception.BusinessException;
import com.educonnect.exception.ResourceNotFoundException;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import com.educonnect.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final DocenteRepository docenteRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;
    private final GrupoRepository grupoRepository;
    private final MatriculaRepository matriculaRepository;
    private final CodigoRecuperacionRepository codigoRecuperacionRepository;
    private final TelemetriaIngresoRepository telemetriaIngresoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthResponse login(AuthRequest request) {
        String identifier = request.getEmail().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmail(identifier)
                .or(() -> usuarioRepository.findByDocumento(request.getEmail().trim()))
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas. Verifique su correo y contraseña."));

        if (!Boolean.TRUE.equals(usuario.getEstado())) {
            throw new BadCredentialsException("Esta cuenta institucional se encuentra deshabilitada o bloqueada por seguridad.");
        }

        if (usuario.getIntentosFallidos() != null && usuario.getIntentosFallidos() >= 5) {
            usuario.setEstado(false);
            usuarioRepository.save(usuario);
            throw new BadCredentialsException("Cuenta bloqueada por superar los 5 intentos fallidos. Utilice la recuperación de contraseña o contacte al Administrador.");
        }

        boolean passwordMatches = verifyAndUpgradePasswordIfNeeded(usuario, request.getPassword());

        if (!passwordMatches) {
            int fallos = (usuario.getIntentosFallidos() == null ? 0 : usuario.getIntentosFallidos()) + 1;
            usuario.setIntentosFallidos(fallos);
            if (fallos >= 5) {
                usuario.setEstado(false);
            }
            usuarioRepository.save(usuario);
            throw new BadCredentialsException("Credenciales inválidas. Intento " + fallos + " de 5.");
        }

        usuario.setIntentosFallidos(0);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                usuario.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        // Registrar evento real en tabla telemetria_ingresos
        telemetriaIngresoRepository.save(TelemetriaIngreso.builder()
                .usuario(usuario)
                .rolAcceso(usuario.getRol().name())
                .moduloVisitado("PORTAL_AUTENTICACION")
                .direccionIp("127.0.0.1")
                .dispositivo("Cliente Web EduConnect")
                .fechaEvento(LocalDateTime.now())
                .build());

        return buildAuthResponse(usuario, jwt);
    }

    private boolean verifyAndUpgradePasswordIfNeeded(Usuario usuario, String rawPassword) {
        String storedHash = usuario.getPasswordHash();
        if (storedHash == null || rawPassword == null) {
            return false;
        }
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }
        // Migración transparente si algún registro antiguo fue guardado sin BCrypt
        if (storedHash.equals(rawPassword)) {
            usuario.setPasswordHash(passwordEncoder.encode(rawPassword));
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public AuthResponse obtenerSesionActual(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario autenticado no encontrado."));
        return buildAuthResponse(usuario, null);
    }

    private AuthResponse buildAuthResponse(Usuario usuario, String jwt) {
        String grupoAsignado = null;
        Long grupoAsignadoId = null;
        boolean esDirectorGrupo = usuario.getRol() == Rol.DIRECTOR_GRUPO;
        Long docenteId = null;
        Long estudianteId = null;
        Long tutorId = null;

        Optional<Docente> docOpt = docenteRepository.findByUsuario_Id(usuario.getId());
        if (docOpt.isPresent()) {
            docenteId = docOpt.get().getId();
            Optional<Grupo> dirGrupo = grupoRepository.findByDirectorGrupo_Id(docenteId);
            if (dirGrupo.isPresent()) {
                esDirectorGrupo = true;
                grupoAsignado = dirGrupo.get().getCodigoGrupo();
                grupoAsignadoId = dirGrupo.get().getId();
            }
        }

        Optional<Estudiante> estOpt = estudianteRepository.findByUsuario_Id(usuario.getId());
        if (estOpt.isPresent()) {
            estudianteId = estOpt.get().getId();
            List<Matricula> mats = matriculaRepository.findByEstudiante_Id(estudianteId);
            if (!mats.isEmpty()) {
                grupoAsignado = mats.get(0).getGrupo().getCodigoGrupo();
                grupoAsignadoId = mats.get(0).getGrupo().getId();
            }
        }

        Optional<Tutor> tutOpt = tutorRepository.findByUsuario_Id(usuario.getId());
        if (tutOpt.isPresent()) {
            tutorId = tutOpt.get().getId();
        }

        return AuthResponse.builder()
                .id(usuario.getId())
                .token(jwt)
                .email(usuario.getEmail())
                .documento(usuario.getDocumento())
                .nombreCompleto(usuario.getNombreCompleto())
                .primerNombre(usuario.getPrimerNombre())
                .primerApellido(usuario.getPrimerApellido())
                .rol(usuario.getRol())
                .grupoAsignado(grupoAsignado)
                .grupoAsignadoId(grupoAsignadoId)
                .esDirectorGrupo(esDirectorGrupo)
                .docenteId(docenteId)
                .estudianteId(estudianteId)
                .tutorId(tutorId)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String emailClean = request.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(emailClean)) {
            throw new BusinessException("El correo electrónico ya está registrado en el sistema.");
        }
        if (usuarioRepository.existsByDocumento(request.getDocumento().trim())) {
            throw new BusinessException("El número de documento ya se encuentra registrado.");
        }

        Rol rolAsignado = request.getRol() != null ? request.getRol() : Rol.ESTUDIANTE;

        Usuario nuevoUsuario = Usuario.builder()
                .tipoDocumento(request.getTipoDocumento() != null ? request.getTipoDocumento().toUpperCase() : "CC")
                .documento(request.getDocumento().trim())
                .email(emailClean)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(rolAsignado)
                .primerNombre(request.getPrimerNombre().trim())
                .segundoNombre(request.getSegundoNombre())
                .primerApellido(request.getPrimerApellido().trim())
                .segundoApellido(request.getSegundoApellido())
                .telefono(request.getTelefono())
                .direccion(request.getDireccion())
                .estado(true)
                .intentosFallidos(0)
                .build();

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        emailService.enviarNotificacionBienvenida(guardado.getEmail(), guardado.getNombreCompleto(), guardado.getRol().name());

        return buildAuthResponse(guardado, null);
    }

    @Transactional
    public Map<String, Object> solicitarRecuperacionPassword(OlvidePasswordRequest request) {
        String emailClean = request.getEmail().trim().toLowerCase();
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(emailClean);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Invalidar códigos previos sin usar
            List<CodigoRecuperacion> previos = codigoRecuperacionRepository.findByEmailAndUsadoFalseOrderByFechaCreacionDesc(emailClean);
            for (CodigoRecuperacion previo : previos) {
                previo.setUsado(true);
            }
            codigoRecuperacionRepository.saveAll(previos);

            // Generar código OTP criptográficamente seguro de 6 dígitos
            String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

            CodigoRecuperacion nuevoCodigo = CodigoRecuperacion.builder()
                    .email(emailClean)
                    .codigo(passwordEncoder.encode(otp))
                    .usado(false)
                    .expiraEn(LocalDateTime.now().plusMinutes(15))
                    .fechaCreacion(LocalDateTime.now())
                    .build();
            codigoRecuperacionRepository.save(nuevoCodigo);

            emailService.enviarCodigoRecuperacion(emailClean, usuario.getNombreCompleto(), otp);
        }

        // Respuesta uniforme que impide enumeración de usuarios y jamás expone el código OTP
        return Map.of(
                "success", true,
                "mensaje", "Si el correo electrónico corresponde a una cuenta institucional registrada, se ha enviado un código de verificación con validez de 15 minutos."
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> verificarCodigo(VerificarCodigoRequest request) {
        String emailClean = request.getEmail().trim().toLowerCase();
        CodigoRecuperacion registro = validarCodigoInterno(emailClean, request.getCodigo().trim());
        return Map.of(
                "valido", registro != null,
                "mensaje", "Código de verificación validado correctamente."
        );
    }

    @Transactional
    public Map<String, Object> restablecerPassword(RestablecerPasswordRequest request) {
        String emailClean = request.getEmail().trim().toLowerCase();
        CodigoRecuperacion registro = validarCodigoInterno(emailClean, request.getCodigo().trim());

        Usuario usuario = usuarioRepository.findByEmail(emailClean)
                .orElseThrow(() -> new BusinessException("No fue posible procesar el restablecimiento para la cuenta indicada."));

        registro.setUsado(true);
        codigoRecuperacionRepository.save(registro);

        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuario.setIntentosFallidos(0);
        usuario.setEstado(true);
        usuarioRepository.save(usuario);

        return Map.of(
                "success", true,
                "mensaje", "Tu contraseña institucional ha sido actualizada exitosamente con cifrado BCrypt."
        );
    }

    private CodigoRecuperacion validarCodigoInterno(String email, String codigoIngresado) {
        List<CodigoRecuperacion> vigentes = codigoRecuperacionRepository.findByEmailAndUsadoFalseOrderByFechaCreacionDesc(email);
        if (vigentes.isEmpty()) {
            throw new BusinessException("El código de verificación es inválido o no existe una solicitud activa.");
        }

        LocalDateTime ahora = LocalDateTime.now();
        for (CodigoRecuperacion reg : vigentes) {
            if (reg.getExpiraEn().isBefore(ahora)) {
                continue;
            }
            String almacenado = reg.getCodigo();
            boolean coincide = (almacenado.startsWith("$2a$") || almacenado.startsWith("$2b$"))
                    ? passwordEncoder.matches(codigoIngresado, almacenado)
                    : almacenado.equals(codigoIngresado);
            if (coincide) {
                return reg;
            }
        }
        throw new BusinessException("El código de verificación es incorrecto o ha expirado.");
    }
}
