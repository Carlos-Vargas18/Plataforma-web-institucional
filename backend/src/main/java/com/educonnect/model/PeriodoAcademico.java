package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "periodos_academicos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"anio_lectivo_id", "numero_periodo"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "anio_lectivo_id", nullable = false)
    private AnioLectivo anioLectivo;

    @Column(name = "numero_periodo", nullable = false)
    private Integer numeroPeriodo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Builder.Default
    @Column(name = "porcentaje_valor", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeValor = new BigDecimal("25.00");

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "fecha_cierre_notas", nullable = false)
    private LocalDateTime fechaCierreNotas;

    @Builder.Default
    @Column(nullable = false)
    private Boolean cerrado = false;
}
