package com.educonnect.repository;

import com.educonnect.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByMatricula_Id(Long matriculaId);
    List<Calificacion> findByMatricula_Estudiante_Id(Long estudianteId);
    List<Calificacion> findByMatricula_Estudiante_Usuario_Id(Long usuarioId);
    List<Calificacion> findByCargaAcademica_IdAndPeriodo_Id(Long cargaAcademicaId, Long periodoId);
    List<Calificacion> findByCargaAcademica_Docente_Id(Long docenteId);
    List<Calificacion> findByMatricula_Grupo_Id(Long grupoId);
    Optional<Calificacion> findByMatricula_IdAndCargaAcademica_IdAndPeriodo_Id(Long matriculaId, Long cargaAcademicaId, Long periodoId);
}
