package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estudiantes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuario usuario;

    @Column(name = "codigo_estudiantil", nullable = false, unique = true, length = 30)
    private String codigoEstudiantil;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 50)
    private String numeroDocumento;

    @Column(nullable = false, length = 150)
    private String nombres;

    @Column(nullable = false, length = 150)
    private String apellidos;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false, length = 15)
    private String genero;

    @Column(name = "tipo_sangre_rh", nullable = false, length = 5)
    private String tipoSangreRh;

    @Column(name = "eps_seguro_medico", nullable = false, length = 100)
    private String epsSeguroMedico;

    @Column(name = "alergias_condiciones_medicas", columnDefinition = "TEXT")
    private String alergiasCondicionesMedicas;

    @Column(name = "medicamentos_permanentes", columnDefinition = "TEXT")
    private String medicamentosPermanentes;

    @Column(name = "direccion_residencia", nullable = false, columnDefinition = "TEXT")
    private String direccionResidencia;

    @Column(name = "estrato_socioeconomico")
    private Integer estratoSocioeconomico;

    @Builder.Default
    @Column(length = 20)
    private String estado = "ACTIVO";

    @OneToMany(mappedBy = "estudiante", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EstudianteTutor> tutores = new ArrayList<>();

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
