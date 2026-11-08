package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "estudiantes_tutores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"estudiante_id", "tutor_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstudianteTutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @Column(nullable = false, length = 30)
    private String parentesco; // MADRE, PADRE, ABUELO_A, TUTOR_LEGAL, etc.

    @Builder.Default
    @Column(name = "es_acudiente_principal", nullable = false)
    private boolean esAcudientePrincipal = false;

    @Builder.Default
    @Column(name = "vive_con_estudiante", nullable = false)
    private boolean viveConEstudiante = true;

    @Builder.Default
    @Column(name = "autorizado_recoger_estudiante", nullable = false)
    private boolean autorizadoRecogerEstudiante = true;

    @Builder.Default
    @Column(name = "contacto_emergencia", nullable = false)
    private boolean contactoEmergencia = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
