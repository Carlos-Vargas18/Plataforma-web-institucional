package com.educonnect.controller;

import com.educonnect.dto.DashboardStatsDto;
import com.educonnect.dto.UsuarioCreateUpdateDto;
import com.educonnect.dto.UsuarioResponseDto;
import com.educonnect.model.Grado;
import com.educonnect.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> obtenerEstadisticas() {
        return ResponseEntity.ok(adminService.obtenerEstadisticasGenerales());
    }

    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDto>> listarUsuarios() {
        return ResponseEntity.ok(adminService.listarTodosLosUsuarios());
    }

    @PostMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDto> crearUsuario(@Valid @RequestBody UsuarioCreateUpdateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearUsuario(dto));
    }

    @PutMapping("/usuarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDto> actualizarUsuario(@PathVariable Long id, @RequestBody UsuarioCreateUpdateDto dto) {
        return ResponseEntity.ok(adminService.actualizarUsuario(id, dto));
    }

    @DeleteMapping("/usuarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> desactivarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.cambiarEstadoOBajaLogicaUsuario(id));
    }

    @GetMapping("/grados")
    public ResponseEntity<List<Grado>> listarGrados() {
        return ResponseEntity.ok(adminService.listarGrados());
    }

    @GetMapping("/grupos")
    public ResponseEntity<List<Map<String, Object>>> listarGrupos() {
        return ResponseEntity.ok(adminService.listarGruposConDetalle());
    }

    @PostMapping("/grupos")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'RECTOR')")
    public ResponseEntity<Map<String, Object>> crearGrupo(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearOActualizarGrupo(null, payload));
    }

    @PutMapping("/grupos/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'RECTOR')")
    public ResponseEntity<Map<String, Object>> actualizarGrupo(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(adminService.crearOActualizarGrupo(id, payload));
    }

    @DeleteMapping("/grupos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> eliminarGrupo(@PathVariable Long id) {
        adminService.eliminarGrupo(id);
        return ResponseEntity.ok(Map.of("mensaje", "Grupo eliminado correctamente."));
    }

    @GetMapping("/materias")
    public ResponseEntity<List<Map<String, Object>>> listarMaterias() {
        return ResponseEntity.ok(adminService.listarMaterias());
    }

    @PostMapping("/materias")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, Object>> crearMateria(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.crearOActualizarMateria(null, payload));
    }

    @PutMapping("/materias/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, Object>> actualizarMateria(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(adminService.crearOActualizarMateria(id, payload));
    }

    @GetMapping("/cargas")
    public ResponseEntity<List<Map<String, Object>>> listarCargas() {
        return ResponseEntity.ok(adminService.listarCargasAcademicas());
    }

    @PostMapping("/cargas")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, Object>> asignarCarga(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.asignarCargaAcademica(payload));
    }

    @DeleteMapping("/cargas/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<Map<String, String>> eliminarCarga(@PathVariable Long id) {
        adminService.eliminarCargaAcademica(id);
        return ResponseEntity.ok(Map.of("mensaje", "Asignación de carga académica eliminada."));
    }

    @GetMapping("/periodos")
    public ResponseEntity<List<Map<String, Object>>> listarPeriodos() {
        return ResponseEntity.ok(adminService.listarPeriodosAcademicos());
    }
}
