package com.educonnect.controller;

import com.educonnect.service.AcademicoInstitucionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comunicados")
@RequiredArgsConstructor
public class ComunicadoController {

    private final AcademicoInstitucionalService academicoService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarComunicados(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(academicoService.listarComunicados(userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECTOR', 'COORDINADOR', 'DIRECTOR_GRUPO', 'DOCENTE')")
    public ResponseEntity<Map<String, Object>> crearComunicado(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicoService.crearComunicado(payload, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECTOR', 'COORDINADOR')")
    public ResponseEntity<Map<String, String>> eliminarComunicado(@PathVariable Long id) {
        academicoService.eliminarComunicado(id);
        return ResponseEntity.ok(Map.of("mensaje", "Comunicado desactivado correctamente."));
    }
}
