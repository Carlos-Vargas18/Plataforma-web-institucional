package com.educonnect.dto;

import com.educonnect.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    private String tipoDocumento = "CC";

    @NotBlank(message = "El número de documento es obligatorio")
    private String documento;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Debe proporcionar un correo válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private Rol rol = Rol.ESTUDIANTE;

    @NotBlank(message = "El primer nombre es obligatorio")
    private String primerNombre;

    private String segundoNombre;

    @NotBlank(message = "El primer apellido es obligatorio")
    private String primerApellido;

    private String segundoApellido;

    private String telefono;
    private String direccion;
}
