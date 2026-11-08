package com.educonnect.repository;

import com.educonnect.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByMatriculaId(Long matriculaId);
    List<Calificacion> findByCargaAcademicaIdAndPeriodoId(Long cargaAcademicaId, Long periodoId);
    Optional<Calificacion> findByMatriculaIdAndCargaAcademicaIdAndPeriodoId(Long matriculaId, Long cargaAcademicaId, Long periodoId);
}
