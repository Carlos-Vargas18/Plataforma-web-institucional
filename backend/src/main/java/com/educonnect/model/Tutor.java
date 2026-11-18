package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tutores")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(length = 100)
    private String ocupacion;

    @Column(name = "empresa_trabajo", length = 120)
    private String empresaTrabajo;

    @Column(name = "telefono_emergencia", nullable = false, length = 25)
    private String telefonoEmergencia;

    @Column(name = "correo_alternativo", length = 120)
    private String correoAlternativo;

    @Builder.Default
    @Column(name = "autorizado_recoger", nullable = false)
    private Boolean autorizadoRecoger = true;
}
