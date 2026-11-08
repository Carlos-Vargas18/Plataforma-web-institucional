package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tutores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 50)
    private String numeroDocumento;

    @Column(nullable = false, length = 150)
    private String nombres;

    @Column(nullable = false, length = 150)
    private String apellidos;

    @Column(name = "telefono_principal", nullable = false, length = 30)
    private String telefonoPrincipal;

    @Column(name = "telefono_secundario", length = 30)
    private String telefonoSecundario;

    @Column(length = 150)
    private String correo;

    @Column(name = "direccion_residencia", nullable = false, columnDefinition = "TEXT")
    private String direccionResidencia;

    @Column(name = "barrio_municipio", length = 100)
    private String barrioMunicipio;

    @Column(length = 120)
    private String ocupacion;

    @Column(name = "lugar_trabajo", length = 150)
    private String lugarTrabajo;

    @Column(name = "telefono_trabajo", length = 30)
    private String telefonoTrabajo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }
}
