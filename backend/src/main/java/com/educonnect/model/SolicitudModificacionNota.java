package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_modificacion_nota")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SolicitudModificacionNota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "calificacion_id")
    private Calificacion calificacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "docente_id", nullable = false)
    private Docente docente;

    @Column(name = "estudiante_nombre", nullable = false, length = 150)
    private String estudianteNombre;

    @Column(name = "materia_nombre", nullable = false, length = 100)
    private String materiaNombre;

    @Column(name = "grupo_codigo", nullable = false, length = 30)
    private String grupoCodigo;

    @Column(name = "periodo_nombre", nullable = false, length = 50)
    private String periodoNombre;

    @Column(name = "nota_anterior", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaAnterior;

    @Column(name = "nota_nueva_cognitiva", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaNuevaCognitiva;

    @Column(name = "nota_nueva_procedimental", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaNuevaProcedimental;

    @Column(name = "nota_nueva_actitudinal", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaNuevaActitudinal;

    @Column(name = "nota_nueva_definitiva", nullable = false, precision = 3, scale = 1)
    private BigDecimal notaNuevaDefinitiva;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String estado = "PENDIENTE";

    @Column(name = "comentario_resolucion", columnDefinition = "TEXT")
    private String comentarioResolucion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aprobado_por_id")
    private Usuario aprobadoPor;

    @Builder.Default
    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;
}
