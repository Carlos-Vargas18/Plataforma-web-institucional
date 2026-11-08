package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "observador_estudiante")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservadorEstudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_id", nullable = false)
    private Docente docente;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fecha;

    @Column(nullable = false, length = 40)
    private String tipo; // FELICITACION, FALTA_LEVE, FALTA_GRAVE, CITACION_ACUDIENTE, SEGUIMIENTO_PSICOPEDAGOGICO

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "compromisos_acordados", columnDefinition = "TEXT")
    private String compromisosAcordados;

    @Builder.Default
    @Column(name = "firmado_por_estudiante")
    private boolean firmadoPorEstudiante = false;

    @Builder.Default
    @Column(name = "firmado_por_tutor")
    private boolean firmadoPorTutor = false;

    @Builder.Default
    @Column(name = "requiere_presencia_padres")
    private boolean requierePresenciaPadres = false;
}
