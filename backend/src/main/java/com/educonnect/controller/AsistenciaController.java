package com.educonnect.controller;

import com.educonnect.service.AcademicoInstitucionalService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/asistencias")
@RequiredArgsConstructor
public class AsistenciaController {

    private final AcademicoInstitucionalService academicoService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> consultarAsistencias(
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) Long cargaAcademicaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(academicoService.consultarAsistencias(estudianteId, cargaAcademicaId, fecha, userDetails.getUsername()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> registrarAsistencia(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(academicoService.registrarAsistencia(payload, userDetails.getUsername()));
    }

    public record Planilla(@NotEmpty List<@NotEmpty Map<String, Object>> registros) {
        public Planilla {
            if (registros != null) {
                registros = Collections.unmodifiableList(new ArrayList<>(registros));
            }
        }
    }

    @PostMapping("/planilla")
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'ADMIN')")
    public List<Map<String, Object>> guardarPlanilla(@Valid @RequestBody Planilla planilla,
            @AuthenticationPrincipal UserDetails userDetails) {
        return academicoService.guardarAsistencias(planilla.registros(), userDetails.getUsername());
    }

    @GetMapping("/justificaciones")
    public ResponseEntity<List<Map<String, Object>>> listarJustificaciones(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(academicoService.listarJustificaciones(userDetails.getUsername()));
    }

    @PostMapping("/justificaciones")
    @PreAuthorize("hasAnyRole('TUTOR', 'ESTUDIANTE', 'COORDINADOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> radicarJustificacion(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(academicoService.radicarJustificacion(payload, userDetails.getUsername()));
    }

    @PutMapping("/justificaciones/{id}")
    @PreAuthorize("hasAnyRole('COORDINADOR', 'DIRECTOR_GRUPO', 'DOCENTE', 'RECTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> revisarJustificacion(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(academicoService.revisarJustificacion(id, payload, userDetails.getUsername()));
    }
}
