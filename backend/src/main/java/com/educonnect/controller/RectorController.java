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
@RequestMapping("/api/v1/rector")
@RequiredArgsConstructor
public class RectorController {

    private final GobiernoYAnaliticaService gobiernoService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        return ResponseEntity.ok(gobiernoService.obtenerResumenEjecutivoRector());
    }

    @GetMapping("/resoluciones")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<Map<String, Object>>> listarResoluciones() {
        return ResponseEntity.ok(gobiernoService.listarResoluciones());
    }

    @PostMapping("/resoluciones")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> emitirResolucion(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(gobiernoService.emitirResolucion(payload, userDetails.getUsername()));
    }

    @PutMapping("/periodos/{id}/estado")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, Object>> cambiarEstadoPeriodo(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        boolean cerrado = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("cerrado", false)));
        return ResponseEntity.ok(gobiernoService.cambiarEstadoPeriodo(id, cerrado));
    }

    @PutMapping("/solicitudes-notas/{id}")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, Object>> resolverSolicitudNota(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(gobiernoService.resolverSolicitudNota(id, payload, userDetails.getUsername()));
    }

    @GetMapping("/promocion")
    @PreAuthorize("hasAnyRole('RECTOR', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<Map<String, Object>>> obtenerActasPromocion() {
        return ResponseEntity.ok(gobiernoService.obtenerActasPromocion());
    }
}
