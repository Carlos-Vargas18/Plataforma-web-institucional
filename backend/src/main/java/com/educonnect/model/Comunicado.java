package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "comunicados")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Comunicado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, length = 180)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Builder.Default
    @Column(name = "destinatario_rol", nullable = false, length = 30)
    private String destinatarioRol = "TODOS";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "grupo_especifico_id")
    private Grupo grupoEspecifico;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String importancia = "NORMAL";

    @Column(name = "archivo_adjunto_url")
    private String archivoAdjuntoUrl;

    @Builder.Default
    @Column(name = "fecha_publicacion", nullable = false)
    private LocalDateTime fechaPublicacion = LocalDateTime.now();

    @Column(name = "fecha_expiracion")
    private LocalDate fechaExpiracion;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;
}
