package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "resoluciones_rectorales")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ResolucionRectoral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_resolucion", nullable = false, unique = true, length = 40)
    private String numeroResolucion;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String considerando;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String resuelve;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "emitido_por_id", nullable = false)
    private Usuario emitidoPor;

    @Builder.Default
    @Column(name = "fecha_emision", nullable = false)
    private LocalDate fechaEmision = LocalDate.now();

    @Builder.Default
    @Column(nullable = false)
    private Boolean vigente = true;
}
