package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "carga_academica", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"grupo_id", "materia_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CargaAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grupo_id", nullable = false)
    private Grupo grupo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "docente_id", nullable = false)
    private Docente docente;

    @Builder.Default
    @Column(name = "intensidad_horaria", nullable = false)
    private Integer intensidadHoraria = 4;
}
