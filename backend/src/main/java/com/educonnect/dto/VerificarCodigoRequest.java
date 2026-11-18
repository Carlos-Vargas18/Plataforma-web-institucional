package com.educonnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerificarCodigoRequest {
    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String email;

    @NotBlank(message = "El código de verificación es obligatorio")
    @Size(min = 6, max = 6, message = "El código debe tener exactamente 6 dígitos")
    private String codigo;
}
