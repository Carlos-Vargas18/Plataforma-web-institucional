package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calificaciones", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"matricula_id", "carga_academica_id", "periodo_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Calificacion {

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
    @Column(name = "nota_cognitiva", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaCognitiva = new BigDecimal("1.0");

    @Builder.Default
    @Column(name = "nota_procedimental", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaProcedimental = new BigDecimal("1.0");

    @Builder.Default
    @Column(name = "nota_actitudinal", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaActitudinal = new BigDecimal("1.0");

    @Builder.Default
    @Column(name = "nota_definitiva_periodo", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaDefinitivaPeriodo = new BigDecimal("1.0");

    @Builder.Default
    @Column(name = "escala_desempeno", nullable = false, length = 20)
    private String escalaDesempeno = "BAJO";

    @Column(name = "juicio_valorativo", columnDefinition = "TEXT")
    private String juicioValorativo;

    @Column(name = "plan_mejoramiento", columnDefinition = "TEXT")
    private String planMejoramiento;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "modificado_por_id")
    private Usuario modificadoPor;

    @Builder.Default
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Builder.Default
    @Column(name = "fecha_ultima_modificacion", nullable = false)
    private LocalDateTime fechaUltimaModificacion = LocalDateTime.now();
}
