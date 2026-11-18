package com.educonnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private long totalEstudiantes;
    private long totalDocentes;
    private long totalGrupos;
    private long totalMaterias;
    private long totalUsuarios;
    private long totalTutores;
    private double promedioInstitucional;
    private double porcentajeAsistencia;
    private long alertasRiesgo;
    private long solicitudesPendientes;
}
