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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ObservadorCitacionController {

    private final AcademicoInstitucionalService academicoService;

    @GetMapping("/observador")
    public ResponseEntity<List<Map<String, Object>>> listarObservador(
            @RequestParam(required = false) Long estudianteId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(academicoService.listarObservador(estudianteId, userDetails.getUsername()));
    }

    @PostMapping("/observador")
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'RECTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> crearObservacion(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicoService.crearObservacion(payload, userDetails.getUsername()));
    }

    @PutMapping("/observador/{id}/firmar")
    public ResponseEntity<Map<String, Object>> firmarObservacion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(academicoService.firmarObservacion(id, userDetails.getUsername()));
    }

    @GetMapping("/citaciones")
    public ResponseEntity<List<Map<String, Object>>> listarCitaciones(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(academicoService.listarCitaciones(userDetails.getUsername()));
    }

    @PostMapping("/citaciones")
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'RECTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> crearCitacion(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicoService.crearCitacion(payload, userDetails.getUsername()));
    }

    @PutMapping("/citaciones/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCitacion(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        return ResponseEntity.ok(academicoService.actualizarEstadoCitacion(id, payload));
    }
}
