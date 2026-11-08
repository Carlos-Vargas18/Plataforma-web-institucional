package com.educonnect.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalEstudiantes;
    private long totalDocentes;
    private long totalTutores;
    private long totalMaterias;
    private long totalGrupos;
    private long totalMatriculasActivas;
}
