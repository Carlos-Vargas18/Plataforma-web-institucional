package com.educonnect.dto;

import com.educonnect.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private Long id;
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String email;
    private String documento;
    private String nombreCompleto;
    private String primerNombre;
    private String primerApellido;
    private Rol rol;
    private String grupoAsignado;
    private Long grupoAsignadoId;
    private Boolean esDirectorGrupo;
    private Long docenteId;
    private Long estudianteId;
    private Long tutorId;
}
