package com.educonnect.controller;

import com.educonnect.dto.CalificacionRequest;
import com.educonnect.model.Calificacion;
import com.educonnect.service.CalificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;

    @PostMapping
    public ResponseEntity<Calificacion> guardarCalificacion(
            @Valid @RequestBody CalificacionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "prof.silva@educonnect.edu.co";
        return ResponseEntity.ok(calificacionService.registrarOActualizarCalificacion(request, email));
    }

    @GetMapping("/matricula/{matriculaId}")
    public ResponseEntity<List<Calificacion>> getCalificacionesPorMatricula(@PathVariable Long matriculaId) {
        return ResponseEntity.ok(calificacionService.obtenerCalificacionesPorMatricula(matriculaId));
    }

    @GetMapping("/carga/{cargaId}/periodo/{periodoId}")
    public ResponseEntity<List<Calificacion>> getCalificacionesPorCargaYPeriodo(
            @PathVariable Long cargaId,
            @PathVariable Long periodoId) {
        return ResponseEntity.ok(calificacionService.obtenerCalificacionesPorCargaYPeriodo(cargaId, periodoId));
    }
}
