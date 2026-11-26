package com.educonnect.model;

public enum Rol {
    ADMIN,
    RECTOR,
    COORDINADOR,
    DIRECTOR_GRUPO,
    DOCENTE,
    ESTUDIANTE,
    TUTOR,
    ADMINISTRATIVO;

    public boolean esAdministrador() {
        return this == ADMIN || this == ADMINISTRATIVO;
    }
}
