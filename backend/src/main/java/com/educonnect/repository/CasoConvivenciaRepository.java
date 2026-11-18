package com.educonnect.repository;

import com.educonnect.model.CasoConvivencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasoConvivenciaRepository extends JpaRepository<CasoConvivencia, Long> {
    List<CasoConvivencia> findAllByOrderByFechaReporteDesc();
    List<CasoConvivencia> findByMatricula_Estudiante_IdOrderByFechaReporteDesc(Long estudianteId);
}
