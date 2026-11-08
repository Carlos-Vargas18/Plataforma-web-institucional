package com.educonnect.service;

import com.educonnect.dto.AuthRequest;
import com.educonnect.dto.AuthResponse;
import com.educonnect.dto.RegisterRequest;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import com.educonnect.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final TutorRepository tutorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generarToken(usuario);

        Long perfilId = null;
        if (usuario.getRol() == Rol.ESTUDIANTE) {
            perfilId = estudianteRepository.findByUsuarioId(usuario.getId())
                    .map(Estudiante::getId).orElse(null);
        } else if (usuario.getRol() == Rol.DOCENTE) {
            perfilId = docenteRepository.findByUsuarioId(usuario.getId())
                    .map(Docente::getId).orElse(null);
        } else if (usuario.getRol() == Rol.TUTOR) {
            perfilId = tutorRepository.findByUsuarioId(usuario.getId())
                    .map(Tutor::getId).orElse(null);
        }

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .nombreCompleto(usuario.getNombreCompleto())
                .avatarUrl(usuario.getAvatarUrl())
                .perfilId(perfilId)
                .build();
    }

    @Transactional
    public AuthResponse registrar(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El correo ya se encuentra registrado");
        }

        Usuario usuario = Usuario.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .primerNombre(request.getPrimerNombre())
                .segundoNombre(request.getSegundoNombre())
                .primerApellido(request.getPrimerApellido())
                .segundoApellido(request.getSegundoApellido())
                .activo(true)
                .build();

        usuario = usuarioRepository.save(usuario);

        Long perfilId = null;

        // Creación transaccional de perfiles según el rol para evitar datos huérfanos
        if (request.getRol() == Rol.DOCENTE && request.getNumeroDocumento() != null) {
            Docente docente = Docente.builder()
                    .usuario(usuario)
                    .tipoDocumento(request.getTipoDocumento() != null ? request.getTipoDocumento() : "CC")
                    .numeroDocumento(request.getNumeroDocumento())
                    .nombres(usuario.getPrimerNombre() + (usuario.getSegundoNombre() != null ? " " + usuario.getSegundoNombre() : ""))
                    .apellidos(usuario.getPrimerApellido() + (usuario.getSegundoApellido() != null ? " " + usuario.getSegundoApellido() : ""))
                    .telefono(request.getTelefono() != null ? request.getTelefono() : "Sin teléfono")
                    .tituloAcademico("Docente Institucional")
                    .fechaContratacion(LocalDate.now())
                    .estado("ACTIVO")
                    .build();
            docente = docenteRepository.save(docente);
            perfilId = docente.getId();
        } else if (request.getRol() == Rol.ESTUDIANTE && request.getNumeroDocumento() != null) {
            String codigo = request.getCodigoEstudiantil() != null 
                    ? request.getCodigoEstudiantil() 
                    : "EST-" + LocalDate.now().getYear() + "-" + usuario.getId();

            Estudiante estudiante = Estudiante.builder()
                    .usuario(usuario)
                    .codigoEstudiantil(codigo)
                    .tipoDocumento(request.getTipoDocumento() != null ? request.getTipoDocumento() : "TI")
                    .numeroDocumento(request.getNumeroDocumento())
                    .nombres(usuario.getPrimerNombre() + (usuario.getSegundoNombre() != null ? " " + usuario.getSegundoNombre() : ""))
                    .apellidos(usuario.getPrimerApellido() + (usuario.getSegundoApellido() != null ? " " + usuario.getSegundoApellido() : ""))
                    .fechaNacimiento(LocalDate.of(2015, 1, 1))
                    .genero("MASCULINO")
                    .tipoSangreRh("O+")
                    .epsSeguroMedico("No especificada")
                    .direccionResidencia("Institución Educativa")
                    .estado("ACTIVO")
                    .build();
            estudiante = estudianteRepository.save(estudiante);
            perfilId = estudiante.getId();
        }

        String token = jwtTokenProvider.generarToken(usuario);

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .nombreCompleto(usuario.getNombreCompleto())
                .avatarUrl(usuario.getAvatarUrl())
                .perfilId(perfilId)
                .build();
    }

    private final java.util.concurrent.ConcurrentHashMap<String, RecoveryEntry> codigosRecuperacion = new java.util.concurrent.ConcurrentHashMap<>();

    private record RecoveryEntry(String codigo, LocalDateTime expiracion) {}

    @Transactional
    public java.util.Map<String, Object> solicitarRecuperacion(com.educonnect.dto.OlvidePasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("El correo ingresado no se encuentra registrado en la institución"));

        String codigo = (request.getCodigo() != null && !request.getCodigo().isBlank())
                ? request.getCodigo()
                : String.valueOf((int) (100000 + Math.random() * 900000));

        codigosRecuperacion.put(email, new RecoveryEntry(codigo, LocalDateTime.now().plusMinutes(15)));

        return java.util.Map.of(
                "success", true,
                "message", "Código de recuperación generado y registrado exitosamente",
                "email", email,
                "codigo", codigo
        );
    }

    @Transactional
    public java.util.Map<String, Object> restablecerPassword(com.educonnect.dto.RestablecerPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        RecoveryEntry entry = codigosRecuperacion.get(email);

        if (entry == null || LocalDateTime.now().isAfter(entry.expiracion()) || !entry.codigo().equals(request.getCodigo().trim())) {
            throw new IllegalArgumentException("Código de verificación inválido o expirado");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);

        codigosRecuperacion.remove(email);

        return java.util.Map.of(
                "success", true,
                "message", "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave."
        );
    }
}
