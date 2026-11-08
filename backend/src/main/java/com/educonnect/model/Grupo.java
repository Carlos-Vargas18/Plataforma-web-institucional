package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "grupos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"año_lectivo_id", "grado_id", "nombre"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"año_lectivo_id\"", nullable = false)
    private AnioLectivo anioLectivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grado_id", nullable = false)
    private Grado grado;

    @Column(nullable = false, length = 50)
    private String nombre; // Ej: 1°A, 2°B

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "director_grupo_docente_id")
    private Docente directorGrupo;

    @Column(name = "salon_aula", length = 60)
    private String salonAula;

    @Builder.Default
    @Column(length = 20)
    private String jornada = "MANANA";

    @Builder.Default
    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo = 35;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
