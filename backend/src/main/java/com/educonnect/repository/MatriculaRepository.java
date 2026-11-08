package com.educonnect.repository;

import com.educonnect.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    Optional<Matricula> findByEstudianteIdAndAnioLectivoEsActualTrue(Long estudianteId);
    List<Matricula> findByGrupoId(Long grupoId);
    List<Matricula> findByEstudianteId(Long estudianteId);
    long countByGrupoId(Long grupoId);
}
