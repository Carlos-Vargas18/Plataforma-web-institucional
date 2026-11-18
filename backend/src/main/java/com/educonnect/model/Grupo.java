package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grupos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"anio_lectivo_id", "codigo_grupo"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "anio_lectivo_id", nullable = false)
    private AnioLectivo anioLectivo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grado_id", nullable = false)
    private Grado grado;

    @Column(name = "codigo_grupo", nullable = false, length = 20)
    private String codigoGrupo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "director_grupo_id")
    private Docente directorGrupo;

    @Column(name = "salon_aula", nullable = false, length = 40)
    private String salonAula;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String jornada = "MAÑANA";

    @Builder.Default
    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo = 35;
}
