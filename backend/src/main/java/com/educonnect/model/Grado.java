package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grados")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Grado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String nivel;

    @Column(name = "numero_orden", nullable = false, unique = true)
    private Integer numeroOrden;
}
