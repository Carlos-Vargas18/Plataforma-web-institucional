package com.educonnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UsuarioCreateUpdateDto {
    private String tipoDocumento;

    @NotBlank(message = "El documento de identidad es obligatorio")
    private String documento;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Pattern(regexp = ".*@.*", message = "El correo debe contener el símbolo @")
    private String email;

    private String password;

    @NotBlank(message = "El rol institucional es obligatorio")
    private String rol;

    private String primerNombre;
    private String segundoNombre;
    private String primerApellido;
    private String segundoApellido;

    // Campos de compatibilidad con formularios frontend
    private String nombre;
    private String apellido;

    private String telefono;
    private String direccion;
    private Boolean estado;

    // Datos opcionales según rol
    private Long grupoId;
    private String grupoCodigo;
    private String especialidad;
    private String tituloProfesional;
    private Long estudianteAcudidoId;
    private java.util.List<Long> estudiantesAcudidosIds;
    private String parentesco;
}
