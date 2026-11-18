package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "estudiantes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "codigo_estudiantil", nullable = false, unique = true, length = 30)
    private String codigoEstudiantil;

    @Builder.Default
    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento = LocalDate.of(2009, 1, 1);

    @Builder.Default
    @Column(length = 15)
    private String genero = "OTRO";

    @Builder.Default
    @Column(name = "rh_grupo_sanguineo", nullable = false, length = 5)
    private String rhGrupoSanguineo = "O+";

    @Builder.Default
    @Column(nullable = false, length = 80)
    private String eps = "Sura EPS";

    @Builder.Default
    @Column(name = "alergias_condiciones", columnDefinition = "TEXT")
    private String alergiasCondiciones = "Ninguna reportada";

    @Builder.Default
    @Column
    private Integer estrato = 3;

    @Builder.Default
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso = LocalDate.now();

    @Builder.Default
    @Column(name = "estado_academico", nullable = false, length = 30)
    private String estadoAcademico = "ACTIVO";
}
