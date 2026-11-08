package com.educonnect.dto;

import com.educonnect.model.Rol;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tipo = "Bearer";
    private Long id;
    private String email;
    private Rol rol;
    private String nombreCompleto;
    private String avatarUrl;
    private Long perfilId; // Id de Docente, Estudiante o Tutor según el rol
}
