package com.educonnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OlvidePasswordRequest {
    @NotBlank(message = "El correo electrónico institucional es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String email;
}
