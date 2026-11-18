package com.educonnect.repository;

import com.educonnect.model.SolicitudModificacionNota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudModificacionNotaRepository extends JpaRepository<SolicitudModificacionNota, Long> {
    List<SolicitudModificacionNota> findAllByOrderByFechaSolicitudDesc();
    List<SolicitudModificacionNota> findByDocente_Usuario_IdOrderByFechaSolicitudDesc(Long usuarioId);
    List<SolicitudModificacionNota> findByEstadoOrderByFechaSolicitudDesc(String estado);
}
