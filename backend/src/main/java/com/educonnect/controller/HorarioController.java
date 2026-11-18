package com.educonnect.controller;

import com.educonnect.service.AcademicoInstitucionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final AcademicoInstitucionalService academicoService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarHorarios(
            @RequestParam(required = false) String grupo,
            @RequestParam(required = false) Long docenteId
    ) {
        return ResponseEntity.ok(academicoService.listarHorarios(grupo, docenteId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'RECTOR')")
    public ResponseEntity<Map<String, Object>> crearBloque(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicoService.crearBloqueHorario(payload));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'RECTOR')")
    public ResponseEntity<Map<String, String>> eliminarBloque(@PathVariable Long id) {
        academicoService.eliminarBloqueHorario(id);
        return ResponseEntity.ok(Map.of("mensaje", "Bloque de horario eliminado correctamente."));
    }
}
