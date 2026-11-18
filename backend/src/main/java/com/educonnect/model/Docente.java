package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "docentes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Docente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "codigo_empleado", nullable = false, unique = true, length = 30)
    private String codigoEmpleado;

    @Column(nullable = false, length = 100)
    private String especialidad;

    @Column(name = "titulo_profesional", nullable = false, length = 150)
    private String tituloProfesional;

    @Builder.Default
    @Column(length = 30)
    private String escalafon = "Grado 2A";

    @Builder.Default
    @Column(name = "fecha_vinculacion", nullable = false)
    private LocalDate fechaVinculacion = LocalDate.now();

    @Builder.Default
    @Column(name = "tipo_contrato", nullable = false, length = 40)
    private String tipoContrato = "TERMINO_INDEFINIDO";

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;
}
