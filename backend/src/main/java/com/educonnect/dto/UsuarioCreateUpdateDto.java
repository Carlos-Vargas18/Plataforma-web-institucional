package com.educonnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioCreateUpdateDto {
    private String tipoDocumento;

    @NotBlank(message = "El documento de identidad es obligatorio")
    private String documento;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Formato de correo inválido")
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
    private String parentesco;
}
