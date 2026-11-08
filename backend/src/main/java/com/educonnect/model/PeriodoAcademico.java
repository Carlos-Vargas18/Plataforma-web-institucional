package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "periodos_academicos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"año_lectivo_id", "numero_periodo"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"año_lectivo_id\"", nullable = false)
    private AnioLectivo anioLectivo;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(name = "numero_periodo", nullable = false)
    private Integer numeroPeriodo;

    @Column(name = "porcentaje_peso", nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajePeso;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private boolean cerrado = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
