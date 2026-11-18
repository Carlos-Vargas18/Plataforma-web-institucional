package com.educonnect.repository;

import com.educonnect.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    Optional<Estudiante> findByUsuarioId(Long usuarioId);
    Optional<Estudiante> findByUsuario_Id(Long usuarioId);
    Optional<Estudiante> findByCodigoEstudiantil(String codigoEstudiantil);
}
