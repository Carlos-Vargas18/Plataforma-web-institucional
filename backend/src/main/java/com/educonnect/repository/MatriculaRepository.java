package com.educonnect.repository;

import com.educonnect.model.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatriculaRepository extends JpaRepository<Matricula, Long> {
    List<Matricula> findByGrupo_Id(Long grupoId);
    List<Matricula> findByEstudiante_Id(Long estudianteId);
    List<Matricula> findByEstudiante_Usuario_Id(Long usuarioId);
    Optional<Matricula> findByEstudiante_IdAndAnioLectivo_ActivoTrue(Long estudianteId);
    Optional<Matricula> findByFolioMatricula(String folioMatricula);
}
