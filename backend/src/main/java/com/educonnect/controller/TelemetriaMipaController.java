package com.educonnect.controller;

import com.educonnect.service.GobiernoYAnaliticaService;
import lombok.RequiredArgsConstructor;
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
public class TelemetriaMipaController {

    private final GobiernoYAnaliticaService gobiernoService;

    @GetMapping("/telemetria/resumen")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECTOR', 'COORDINADOR', 'DIRECTOR_GRUPO')")
    public ResponseEntity<Map<String, Object>> obtenerTelemetria() {
        return ResponseEntity.ok(gobiernoService.obtenerResumenTelemetria());
    }

    @GetMapping("/mipa/alertas-desercion")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECTOR', 'COORDINADOR', 'DIRECTOR_GRUPO')")
    public ResponseEntity<List<Map<String, Object>>> obtenerAlertasMipa() {
        return ResponseEntity.ok(gobiernoService.calcularYListarAlertasMipa());
    }

    @PostMapping("/mipa/{id}/intervenir")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECTOR', 'COORDINADOR', 'DIRECTOR_GRUPO')")
    public ResponseEntity<Map<String, Object>> registrarIntervencionMipa(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        return ResponseEntity.ok(gobiernoService.registrarIntervencionMipa(id, payload));
    }

    @PostMapping("/edubot/consulta")
    public ResponseEntity<Map<String, Object>> consultarEduBot(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(gobiernoService.responderConsultaEduBot(
                payload.getOrDefault("pregunta", ""),
                userDetails.getUsername()
        ));
    }
}
