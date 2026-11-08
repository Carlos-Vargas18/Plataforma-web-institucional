package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "matriculas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"estudiante_id", "año_lectivo_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"año_lectivo_id\"", nullable = false)
    private AnioLectivo anioLectivo;

    @Column(name = "numero_folio", nullable = false, unique = true, length = 60)
    private String numeroFolio;

    @Builder.Default
    @Column(name = "fecha_matricula", nullable = false)
    private LocalDate fechaMatricula = LocalDate.now();

    @Builder.Default
    @Column(length = 20)
    private String estado = "ACTIVA"; // ACTIVA, RETIRADO, SUSPENDIDO, GRADUADO, TRASLADADO

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Builder.Default
    @Column(name = "promedio_general", precision = 4, scale = 2)
    private BigDecimal promedioGeneral = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
