package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "asistencias", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"matricula_id", "carga_academica_id", "fecha_clase"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "carga_academica_id", nullable = false)
    private CargaAcademica cargaAcademica;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "periodo_id", nullable = false)
    private PeriodoAcademico periodo;

    @Builder.Default
    @Column(name = "fecha_clase", nullable = false)
    private LocalDate fechaClase = LocalDate.now();

    @Column(name = "estado_asistencia", nullable = false, length = 20)
    private String estadoAsistencia;

    @Builder.Default
    @Column(name = "minutos_retraso")
    private Integer minutosRetraso = 0;

    @Column(length = 255)
    private String observacion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean justificada = false;

    @Column(name = "soporte_excusa_url", length = 255)
    private String soporteExcusaUrl;
}
