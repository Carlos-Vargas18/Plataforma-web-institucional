package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materias")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_oficial", nullable = false, unique = true, length = 20)
    private String codigoOficial;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "area_conocimiento", nullable = false, length = 100)
    private String areaConocimiento;

    @Builder.Default
    @Column(name = "horas_semanales", nullable = false)
    private Integer horasSemanales = 4;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activa = true;
}
