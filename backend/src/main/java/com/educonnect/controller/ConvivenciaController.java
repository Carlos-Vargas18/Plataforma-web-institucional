package com.educonnect.controller;

import com.educonnect.service.GobiernoYAnaliticaService;
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
@RequestMapping("/api/v1/convivencia")
@RequiredArgsConstructor
public class ConvivenciaController {

    private final GobiernoYAnaliticaService gobiernoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINADOR', 'RECTOR', 'ADMIN', 'DIRECTOR_GRUPO', 'DOCENTE')")
    public ResponseEntity<List<Map<String, Object>>> listarCasos() {
        return ResponseEntity.ok(gobiernoService.listarCasosConvivencia());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COORDINADOR', 'RECTOR', 'ADMIN', 'DIRECTOR_GRUPO', 'DOCENTE')")
    public ResponseEntity<Map<String, Object>> crearCaso(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gobiernoService.crearCasoConvivencia(payload, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'RECTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> actualizarCaso(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        return ResponseEntity.ok(gobiernoService.actualizarEstadoCasoConvivencia(id, payload));
    }
}
