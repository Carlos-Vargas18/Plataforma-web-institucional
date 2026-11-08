package com.educonnect.repository;

import com.educonnect.model.CargaAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CargaAcademicaRepository extends JpaRepository<CargaAcademica, Long> {
    List<CargaAcademica> findByDocenteId(Long docenteId);
    List<CargaAcademica> findByGrupoId(Long grupoId);
}
