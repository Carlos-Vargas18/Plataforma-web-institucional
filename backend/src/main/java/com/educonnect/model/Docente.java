package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "docentes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Docente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 50)
    private String numeroDocumento;

    @Column(nullable = false, length = 150)
    private String nombres;

    @Column(nullable = false, length = 150)
    private String apellidos;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(name = "titulo_academico", nullable = false, length = 150)
    private String tituloAcademico;

    @Column(length = 150)
    private String especialidad;

    @Column(name = "escalafon_categoria", length = 50)
    private String escalafonCategoria;

    @Builder.Default
    @Column(name = "fecha_contratacion", nullable = false)
    private LocalDate fechaContratacion = LocalDate.now();

    @Builder.Default
    @Column(length = 20)
    private String estado = "ACTIVO";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }
}
