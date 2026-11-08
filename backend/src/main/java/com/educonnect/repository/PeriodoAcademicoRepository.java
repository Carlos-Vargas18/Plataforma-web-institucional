package com.educonnect.repository;

import com.educonnect.model.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeriodoAcademicoRepository extends JpaRepository<PeriodoAcademico, Long> {
    List<PeriodoAcademico> findByAnioLectivoEsActualTrueOrderByNumeroPeriodoAsc();
}
