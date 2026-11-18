package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citaciones_padres")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CitacionPadre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "convocado_por_id", nullable = false)
    private Usuario convocadoPor;

    @Column(name = "fecha_hora_cita", nullable = false)
    private LocalDateTime fechaHoraCita;

    @Builder.Default
    @Column(name = "lugar_o_enlace", nullable = false, length = 180)
    private String lugarOEnlace = "Sala de Coordinación - Sede Principal";

    @Column(name = "motivo_citacion", nullable = false, columnDefinition = "TEXT")
    private String motivoCitacion;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String modalidad = "PRESENCIAL";

    @Builder.Default
    @Column(name = "estado_cita", nullable = false, length = 30)
    private String estadoCita = "PENDIENTE";

    @Column(name = "compromisos_acta", columnDefinition = "TEXT")
    private String compromisosActa;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
