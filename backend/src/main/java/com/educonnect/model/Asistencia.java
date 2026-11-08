package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asistencias", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"matricula_id", "carga_academica_id", "fecha"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carga_academica_id", nullable = false)
    private CargaAcademica cargaAcademica;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 25)
    private String estado; // PRESENTE, AUSENTE_JUSTIFICADO, AUSENTE_INJUSTIFICADO, TARDE

    @Column(name = "motivo_justificacion", columnDefinition = "TEXT")
    private String motivoJustificacion;

    @Builder.Default
    @Column(name = "notificado_a_tutor")
    private boolean notificadoATutor = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
