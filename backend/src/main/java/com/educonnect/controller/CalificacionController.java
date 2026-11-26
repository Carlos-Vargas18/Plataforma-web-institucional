package com.educonnect.controller;

import com.educonnect.dto.CalificacionRequest;
import com.educonnect.service.CalificacionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> consultarCalificaciones(
            @RequestParam(required = false) Long cargaAcademicaId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) Long grupoId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(calificacionService.consultarCalificaciones(
                cargaAcademicaId,
                periodoId,
                estudianteId,
                grupoId,
                userDetails.getUsername()
        ));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'RECTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> guardarCalificacion(
            @Valid @RequestBody CalificacionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(calificacionService.registrarOActualizarNota(request, userDetails.getUsername()));
    }

    public record Planilla(@NotEmpty List<@NotNull @Valid CalificacionRequest> registros) {
        public Planilla {
            if (registros != null) {
                registros = Collections.unmodifiableList(new ArrayList<>(registros));
            }
        }
    }

    @PostMapping("/planilla")
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'RECTOR', 'ADMIN')")
    public List<Map<String, Object>> guardarPlanilla(@Valid @RequestBody Planilla planilla,
            @AuthenticationPrincipal UserDetails userDetails) {
        return calificacionService.guardarPlanilla(planilla.registros(), userDetails.getUsername());
    }

    @GetMapping("/solicitudes")
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'RECTOR', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> listarSolicitudes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(calificacionService.listarSolicitudesModificacion(userDetails.getUsername()));
    }

    @PostMapping("/solicitudes")
    @PreAuthorize("hasAnyRole('DOCENTE', 'DIRECTOR_GRUPO', 'COORDINADOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> crearSolicitud(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(calificacionService.crearSolicitudModificacion(payload, userDetails.getUsername()));
    }
}
