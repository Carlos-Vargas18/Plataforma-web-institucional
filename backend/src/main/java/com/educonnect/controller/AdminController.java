package com.educonnect.controller;

import com.educonnect.dto.DashboardStatsDto;
import com.educonnect.model.Grupo;
import com.educonnect.model.Materia;
import com.educonnect.model.Usuario;
import com.educonnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getEstadisticas() {
        return ResponseEntity.ok(adminService.obtenerEstadisticas());
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<Usuario>> getUsuarios() {
        return ResponseEntity.ok(adminService.listarUsuarios());
    }

    @GetMapping("/materias")
    public ResponseEntity<List<Materia>> getMaterias() {
        return ResponseEntity.ok(adminService.listarMaterias());
    }

    @PostMapping("/materias")
    public ResponseEntity<Materia> crearMateria(@RequestBody Materia materia) {
        return ResponseEntity.ok(adminService.crearMateria(materia));
    }

    @DeleteMapping("/materias/{id}")
    public ResponseEntity<Void> eliminarMateria(@PathVariable Long id) {
        adminService.eliminarMateria(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/grupos")
    public ResponseEntity<List<Grupo>> getGrupos() {
        return ResponseEntity.ok(adminService.listarGrupos());
    }
}
