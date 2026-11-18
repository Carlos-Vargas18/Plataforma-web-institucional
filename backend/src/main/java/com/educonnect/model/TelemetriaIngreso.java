package com.educonnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetria_ingresos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TelemetriaIngreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "rol_acceso", nullable = false, length = 30)
    private String rolAcceso;

    @Column(name = "modulo_visitado", nullable = false, length = 60)
    private String moduloVisitado;

    @Builder.Default
    @Column(name = "direccion_ip", length = 45)
    private String direccionIp = "127.0.0.1";

    @Builder.Default
    @Column(length = 120)
    private String dispositivo = "Web Browser";

    @Builder.Default
    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento = LocalDateTime.now();
}
