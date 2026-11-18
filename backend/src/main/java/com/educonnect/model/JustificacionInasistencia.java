package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "justificaciones_inasistencia")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JustificacionInasistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asistencia_id", nullable = false, unique = true)
    private Asistencia asistencia;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @Column(name = "motivo_excusa", nullable = false, columnDefinition = "TEXT")
    private String motivoExcusa;

    @Builder.Default
    @Column(name = "tipo_excusa", nullable = false, length = 30)
    private String tipoExcusa = "MEDICA";

    @Column(name = "soporte_url")
    private String soporteUrl;

    @Builder.Default
    @Column(name = "estado_revision", nullable = false, length = 25)
    private String estadoRevision = "PENDIENTE_REVISION";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "revisado_por_id")
    private Usuario revisadoPor;

    @Column(name = "observacion_coordinacion", columnDefinition = "TEXT")
    private String observacionCoordinacion;

    @Builder.Default
    @Column(name = "fecha_radicacion", nullable = false, updatable = false)
    private LocalDateTime fechaRadicacion = LocalDateTime.now();
}
