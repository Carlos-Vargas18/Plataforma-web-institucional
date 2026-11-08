package com.educonnect.repository;

import com.educonnect.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {
    Optional<Estudiante> findByCodigoEstudiantil(String codigoEstudiantil);
    Optional<Estudiante> findByNumeroDocumento(String numeroDocumento);
    Optional<Estudiante> findByUsuarioId(Long usuarioId);

    @Query("SELECT e FROM Estudiante e JOIN e.tutores et WHERE et.tutor.id = :tutorId")
    List<Estudiante> findByTutorId(@Param("tutorId") Long tutorId);
}
