package com.educonnect.repository;

import com.educonnect.model.CargaAcademica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CargaAcademicaRepository extends JpaRepository<CargaAcademica, Long> {
    List<CargaAcademica> findByDocente_Id(Long docenteId);
    List<CargaAcademica> findByDocente_Usuario_Id(Long usuarioId);
    List<CargaAcademica> findByGrupo_Id(Long grupoId);
    Optional<CargaAcademica> findByGrupo_IdAndMateria_Id(Long grupoId, Long materiaId);
}
