package com.educonnect.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CalificacionRequest {

    private Long matriculaId;
    private Long estudianteId;

    @NotNull(message = "El ID de la carga académica es obligatorio")
    private Long cargaAcademicaId;

    @NotNull(message = "El ID del periodo académico es obligatorio")
    private Long periodoId;

    @NotNull(message = "La nota cognitiva (Saber 40%) es obligatoria")
    @DecimalMin(value = "1.0", message = "La nota mínima en la escala nacional es 1.0")
    @DecimalMax(value = "5.0", message = "La nota máxima en la escala nacional es 5.0")
    private BigDecimal notaCognitiva;

    @NotNull(message = "La nota procedimental (Hacer 30%) es obligatoria")
    @DecimalMin(value = "1.0", message = "La nota mínima es 1.0")
    @DecimalMax(value = "5.0", message = "La nota máxima es 5.0")
    private BigDecimal notaProcedimental;

    @NotNull(message = "La nota actitudinal (Ser 30%) es obligatoria")
    @DecimalMin(value = "1.0", message = "La nota mínima es 1.0")
    @DecimalMax(value = "5.0", message = "La nota máxima es 5.0")
    private BigDecimal notaActitudinal;

    private String juicioValorativo;
    private String planMejoramiento;
}
