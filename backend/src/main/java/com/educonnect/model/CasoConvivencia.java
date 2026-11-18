package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "casos_convivencia")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CasoConvivencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String radicado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reportado_por_id", nullable = false)
    private Usuario reportadoPor;

    @Builder.Default
    @Column(name = "fecha_reporte", nullable = false)
    private LocalDateTime fechaReporte = LocalDateTime.now();

    @Column(name = "tipo_situacion", nullable = false, length = 20)
    private String tipoSituacion;

    @Column(nullable = false, length = 20)
    private String severidad;

    @Column(name = "descripcion_suceso", nullable = false, columnDefinition = "TEXT")
    private String descripcionSuceso;

    @Column(columnDefinition = "TEXT")
    private String involucrados;

    @Column(name = "medida_pedagogica", columnDefinition = "TEXT")
    private String medidaPedagogica;

    @Builder.Default
    @Column(name = "remitido_comite", nullable = false)
    private Boolean remitidoComite = false;

    @Builder.Default
    @Column(name = "estado_caso", nullable = false, length = 30)
    private String estadoCaso = "ABIERTO";

    @Column(name = "acta_cierre", columnDefinition = "TEXT")
    private String actaCierre;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;
}
