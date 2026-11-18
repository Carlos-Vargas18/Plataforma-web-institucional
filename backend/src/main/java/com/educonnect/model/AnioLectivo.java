package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "anios_lectivos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AnioLectivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "anio", nullable = false, unique = true)
    private Integer anio;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "resolucion_rectoral", length = 100)
    private String resolucionRectoral;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = false;
}
