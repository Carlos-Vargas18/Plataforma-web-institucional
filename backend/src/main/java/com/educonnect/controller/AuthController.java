package com.educonnect.controller;

import com.educonnect.dto.*;
import com.educonnect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> obtenerPerfilActual(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.obtenerSesionActual(userDetails.getUsername()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/olvide-password")
    public ResponseEntity<Map<String, Object>> olvidePassword(@Valid @RequestBody OlvidePasswordRequest request) {
        return ResponseEntity.ok(authService.solicitarRecuperacionPassword(request));
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<Map<String, Object>> verificarCodigo(@Valid @RequestBody VerificarCodigoRequest request) {
        return ResponseEntity.ok(authService.verificarCodigo(request));
    }

    @PostMapping("/restablecer-password")
    public ResponseEntity<Map<String, Object>> restablecerPassword(@Valid @RequestBody RestablecerPasswordRequest request) {
        return ResponseEntity.ok(authService.restablecerPassword(request));
    }
}
