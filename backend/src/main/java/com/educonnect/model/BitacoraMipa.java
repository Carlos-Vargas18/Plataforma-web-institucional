package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bitacora_mipa")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BitacoraMipa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @Column(name = "indice_riesgo", nullable = false, precision = 5, scale = 2)
    private BigDecimal indiceRiesgo;

    @Column(name = "nivel_alerta", nullable = false, length = 20)
    private String nivelAlerta;

    @Column(name = "factores_detectados", nullable = false, columnDefinition = "TEXT")
    private String factoresDetectados;

    @Column(name = "intervencion_sugerida", nullable = false, columnDefinition = "TEXT")
    private String intervencionSugerida;

    @Builder.Default
    @Column(name = "atendido_orientacion", nullable = false)
    private Boolean atendidoOrientacion = false;

    @Builder.Default
    @Column(name = "fecha_calculo", nullable = false)
    private LocalDateTime fechaCalculo = LocalDateTime.now();
}
