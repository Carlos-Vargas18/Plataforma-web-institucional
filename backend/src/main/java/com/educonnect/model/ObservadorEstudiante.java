package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "observador_estudiante")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ObservadorEstudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "periodo_id", nullable = false)
    private PeriodoAcademico periodo;

    @Builder.Default
    @Column(name = "fecha_suceso", nullable = false)
    private LocalDate fechaSuceso = LocalDate.now();

    @Column(name = "tipo_anotacion", nullable = false, length = 30)
    private String tipoAnotacion;

    @Builder.Default
    @Column(name = "categoria_falta", length = 20)
    private String categoriaFalta = "NO_APLICA";

    @Column(name = "descripcion_hechos", nullable = false, columnDefinition = "TEXT")
    private String descripcionHechos;

    @Column(name = "descargos_estudiante", columnDefinition = "TEXT")
    private String descargosEstudiante;

    @Column(name = "compromisos_acordados", nullable = false, columnDefinition = "TEXT")
    private String compromisosAcordados;

    @Builder.Default
    @Column(name = "firmado_estudiante", nullable = false)
    private Boolean firmadoEstudiante = false;

    @Builder.Default
    @Column(name = "firmado_acudiente", nullable = false)
    private Boolean firmadoAcudiente = false;

    @Builder.Default
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
