package com.educonnect.controller;

import com.educonnect.service.GobiernoYAnaliticaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PortalesRolController {

    private final GobiernoYAnaliticaService gobiernoService;

    @GetMapping("/docente/contexto")
    public ResponseEntity<Map<String, Object>> obtenerContextoDocente(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(gobiernoService.obtenerContextoDocente(userDetails.getUsername()));
    }

    @GetMapping("/tutor/acudidos")
    public ResponseEntity<List<Map<String, Object>>> obtenerAcudidosTutor(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(gobiernoService.obtenerAcudidosTutor(userDetails.getUsername()));
    }
}
