package com.educonnect.repository;

import com.educonnect.model.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    List<PeriodoAcademico> findByAnioLectivo_IdOrderByNumeroPeriodoAsc(Long anioLectivoId);
    List<PeriodoAcademico> findAllByOrderByNumeroPeriodoAsc();
    Optional<PeriodoAcademico> findByNumeroPeriodoAndAnioLectivo_ActivoTrue(Integer numeroPeriodo);
}
