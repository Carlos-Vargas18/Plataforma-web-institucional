package com.educonnect.repository;

import com.educonnect.model.CitacionPadre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitacionPadreRepository extends JpaRepository<CitacionPadre, Long> {
    List<CitacionPadre> findAllByOrderByFechaHoraCitaDesc();
    List<CitacionPadre> findByTutor_Usuario_IdOrderByFechaHoraCitaDesc(Long tutorUsuarioId);
    List<CitacionPadre> findByConvocadoPor_IdOrderByFechaHoraCitaDesc(Long usuarioId);
    List<CitacionPadre> findByEstudiante_IdOrderByFechaHoraCitaDesc(Long estudianteId);
}
