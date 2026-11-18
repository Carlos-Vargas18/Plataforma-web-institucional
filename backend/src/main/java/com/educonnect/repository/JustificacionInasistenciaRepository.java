package com.educonnect.repository;

import com.educonnect.model.JustificacionInasistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JustificacionInasistenciaRepository extends JpaRepository<JustificacionInasistencia, Long> {
    List<JustificacionInasistencia> findAllByOrderByFechaRadicacionDesc();
    List<JustificacionInasistencia> findByTutor_Usuario_IdOrderByFechaRadicacionDesc(Long tutorUsuarioId);
    Optional<JustificacionInasistencia> findByAsistencia_Id(Long asistenciaId);
}
