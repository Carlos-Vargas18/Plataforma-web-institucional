package com.educonnect.repository;

import com.educonnect.model.Comunicado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {
    List<Comunicado> findByActivoTrueOrderByFechaPublicacionDesc();
    List<Comunicado> findByDestinatarioRolInAndActivoTrueOrderByFechaPublicacionDesc(List<String> roles);
}
