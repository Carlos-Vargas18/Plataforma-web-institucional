package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_escolares", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"anio_lectivo_id", "grupo_id", "dia_semana", "bloque_orden"}),
    @UniqueConstraint(columnNames = {"anio_lectivo_id", "docente_id", "dia_semana", "bloque_orden"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HorarioEscolar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "anio_lectivo_id", nullable = false)
    private AnioLectivo anioLectivo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "docente_id", nullable = false)
    private Docente docente;

    @Column(name = "dia_semana", nullable = false, length = 15)
    private String diaSemana;

    @Column(name = "bloque_orden", nullable = false)
    private Integer bloqueOrden;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(nullable = false, length = 50)
    private String aula;
}
