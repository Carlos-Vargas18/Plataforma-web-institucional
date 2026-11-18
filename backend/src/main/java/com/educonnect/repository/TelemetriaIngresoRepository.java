package com.educonnect.repository;

import com.educonnect.model.TelemetriaIngreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetriaIngresoRepository extends JpaRepository<TelemetriaIngreso, Long> {
    List<TelemetriaIngreso> findTop50ByOrderByFechaEventoDesc();
}
