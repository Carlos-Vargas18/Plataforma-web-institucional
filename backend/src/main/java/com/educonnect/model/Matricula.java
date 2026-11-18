package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "matriculas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"estudiante_id", "anio_lectivo_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "folio_matricula", nullable = false, unique = true, length = 30)
    private String folioMatricula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "anio_lectivo_id", nullable = false)
    private AnioLectivo anioLectivo;

    @Builder.Default
    @Column(name = "fecha_matricula", nullable = false)
    private LocalDate fechaMatricula = LocalDate.now();

    @Builder.Default
    @Column(name = "es_repitente", nullable = false)
    private Boolean esRepitente = false;

    @Builder.Default
    @Column(name = "paz_y_salvo", nullable = false)
    private Boolean pazYSalvo = true;

    @Builder.Default
    @Column(name = "estado_matricula", nullable = false, length = 30)
    private String estadoMatricula = "ACTIVA";
}
