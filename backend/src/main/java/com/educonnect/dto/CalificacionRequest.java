package com.educonnect.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalificacionRequest {

    @NotNull(message = "El id de matrícula es obligatorio")
    private Long matriculaId;

    @NotNull(message = "El id de carga académica es obligatorio")
    private Long cargaAcademicaId;

    @NotNull(message = "El id de periodo es obligatorio")
    private Long periodoId;

    @DecimalMin(value = "0.00", message = "La nota cognitiva no puede ser menor a 0.0")
    @DecimalMax(value = "5.00", message = "La nota cognitiva no puede ser mayor a 5.0")
    private BigDecimal notaCognitiva;

    @DecimalMin(value = "0.00", message = "La nota procedimental no puede ser menor a 0.0")
    @DecimalMax(value = "5.00", message = "La nota procedimental no puede ser mayor a 5.0")
    private BigDecimal notaProcedimental;

    @DecimalMin(value = "0.00", message = "La nota actitudinal no puede ser menor a 0.0")
    @DecimalMax(value = "5.00", message = "La nota actitudinal no puede ser mayor a 5.0")
    private BigDecimal notaActitudinal;

    private String observaciones;
}
