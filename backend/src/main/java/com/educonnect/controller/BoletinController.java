package com.educonnect.controller;

import com.educonnect.service.AcademicoInstitucionalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/boletines")
@RequiredArgsConstructor
public class BoletinController {

    private final AcademicoInstitucionalService academicoService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerBoletin(
            @RequestParam(required = false) Long estudianteId,
            @RequestParam(required = false) Integer periodo,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(academicoService.generarBoletinOficial(estudianteId, periodo, userDetails.getUsername()));
    }
}
