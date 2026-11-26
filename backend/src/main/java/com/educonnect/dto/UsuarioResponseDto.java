package com.educonnect.dto;

import com.educonnect.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioResponseDto {
    private Long id;
    private String tipoDocumento;
    private String documento;
    private String email;
    private Rol rol;
    private String primerNombre;
    private String segundoNombre;
    private String primerApellido;
    private String segundoApellido;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private String telefono;
    private String direccion;
    private Boolean estado;
    private String grupo;
    private Long grupoId;
    private String especialidad;
    private java.util.List<Long> estudiantesAcudidosIds;
    private String parentesco;
    private LocalDateTime ultimoAcceso;
    private LocalDateTime fechaCreacion;
}
