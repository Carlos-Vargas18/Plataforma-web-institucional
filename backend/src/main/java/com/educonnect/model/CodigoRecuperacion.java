package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "codigos_recuperacion")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CodigoRecuperacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 120)
    private String codigo;

    @Builder.Default
    @Column(nullable = false)
    private Boolean usado = false;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
