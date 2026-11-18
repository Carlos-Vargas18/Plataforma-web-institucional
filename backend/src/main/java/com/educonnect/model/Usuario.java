package com.educonnect.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento = "CC";

    @Column(nullable = false, unique = true, length = 30)
    private String documento;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Rol rol;

    @Column(name = "primer_nombre", nullable = false, length = 60)
    private String primerNombre;

    @Column(name = "segundo_nombre", length = 60)
    private String segundoNombre;

    @Column(name = "primer_apellido", nullable = false, length = 60)
    private String primerApellido;

    @Column(name = "segundo_apellido", length = 60)
    private String segundoApellido;

    @Column(length = 25)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @Column(name = "foto_perfil_url")
    private String fotoPerfilUrl;

    @Builder.Default
    @Column(nullable = false)
    private Boolean estado = true;

    @Builder.Default
    @Column(name = "intentos_fallidos", nullable = false)
    private Integer intentosFallidos = 0;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Builder.Default
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public boolean isActivo() {
        return Boolean.TRUE.equals(this.estado);
    }

    public String getNombreCompleto() {
        StringBuilder sb = new StringBuilder(primerNombre != null ? primerNombre : "");
        if (segundoNombre != null && !segundoNombre.isBlank()) {
            sb.append(" ").append(segundoNombre);
        }
        if (primerApellido != null && !primerApellido.isBlank()) {
            sb.append(" ").append(primerApellido);
        }
        if (segundoApellido != null && !segundoApellido.isBlank()) {
            sb.append(" ").append(segundoApellido);
        }
        return sb.toString().trim();
    }
}
