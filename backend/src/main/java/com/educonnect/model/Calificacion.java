package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "calificaciones", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"matricula_id", "carga_academica_id", "periodo_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carga_academica_id", nullable = false)
    private CargaAcademica cargaAcademica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "periodo_id", nullable = false)
    private PeriodoAcademico periodo;

    @Column(name = "nota_cognitiva", precision = 4, scale = 2)
    private BigDecimal notaCognitiva; // 40%

    @Column(name = "nota_procedimental", precision = 4, scale = 2)
    private BigDecimal notaProcedimental; // 40%

    @Column(name = "nota_actitudinal", precision = 4, scale = 2)
    private BigDecimal notaActitudinal; // 20%

    @Column(name = "nota_definitiva_periodo", precision = 4, scale = 2)
    private BigDecimal notaDefinitivaPeriodo;

    @Column(length = 20)
    private String desempeno; // SUPERIOR, ALTO, BASICO, BAJO

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @CreationTimestamp
    @Column(name = "fecha_calificacion", updatable = false)
    private LocalDateTime fechaCalificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actualizado_por_docente_id")
    private Docente actualizadoPorDocente;

    public void calcularNotaDefinitiva() {
        if (notaCognitiva != null && notaProcedimental != null && notaActitudinal != null) {
            BigDecimal cog = notaCognitiva.multiply(new BigDecimal("0.40"));
            BigDecimal proc = notaProcedimental.multiply(new BigDecimal("0.40"));
            BigDecimal act = notaActitudinal.multiply(new BigDecimal("0.20"));
            this.notaDefinitivaPeriodo = cog.add(proc).add(act).setScale(2, RoundingMode.HALF_UP);

            if (this.notaDefinitivaPeriodo.compareTo(new BigDecimal("4.60")) >= 0) {
                this.desempeno = "SUPERIOR";
            } else if (this.notaDefinitivaPeriodo.compareTo(new BigDecimal("4.00")) >= 0) {
                this.desempeno = "ALTO";
            } else if (this.notaDefinitivaPeriodo.compareTo(new BigDecimal("3.00")) >= 0) {
                this.desempeno = "BASICO";
            } else {
                this.desempeno = "BAJO";
            }
        }
    }
}
