package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "estudiante_tutor", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"estudiante_id", "tutor_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EstudianteTutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @Builder.Default
    @Column(nullable = false, length = 40)
    private String parentesco = "PADRE";

    @Builder.Default
    @Column(name = "es_acudiente_principal", nullable = false)
    private Boolean esAcudientePrincipal = false;

    @Builder.Default
    @Column(name = "vive_con_estudiante", nullable = false)
    private Boolean viveConEstudiante = true;

    @Builder.Default
    @Column(name = "responsable_economico", nullable = false)
    private Boolean responsableEconomico = true;
}
