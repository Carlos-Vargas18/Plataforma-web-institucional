package com.educonnect.repository;

import com.educonnect.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findByMatricula_IdOrderByFechaClaseDesc(Long matriculaId);
    List<Asistencia> findByMatricula_Estudiante_IdOrderByFechaClaseDesc(Long estudianteId);
    List<Asistencia> findByMatricula_Estudiante_Usuario_IdOrderByFechaClaseDesc(Long usuarioId);
    List<Asistencia> findByCargaAcademica_IdAndFechaClase(Long cargaAcademicaId, LocalDate fechaClase);
    List<Asistencia> findByCargaAcademica_Docente_IdOrderByFechaClaseDesc(Long docenteId);
    Optional<Asistencia> findByMatricula_IdAndCargaAcademica_IdAndFechaClase(Long matriculaId, Long cargaAcademicaId, LocalDate fechaClase);
}
