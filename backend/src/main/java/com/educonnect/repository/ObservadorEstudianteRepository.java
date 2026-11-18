package com.educonnect.repository;

import com.educonnect.model.ObservadorEstudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservadorEstudianteRepository extends JpaRepository<ObservadorEstudiante, Long> {
    List<ObservadorEstudiante> findByMatricula_IdOrderByFechaSucesoDesc(Long matriculaId);
    List<ObservadorEstudiante> findByMatricula_Estudiante_IdOrderByFechaSucesoDesc(Long estudianteId);
    List<ObservadorEstudiante> findByMatricula_Estudiante_Usuario_IdOrderByFechaSucesoDesc(Long usuarioId);
    List<ObservadorEstudiante> findAllByOrderByFechaSucesoDesc();
}
