package com.educonnect.repository;

import com.educonnect.model.AnioLectivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnioLectivoRepository extends JpaRepository<AnioLectivo, Long> {
    Optional<AnioLectivo> findByActivoTrue();
    Optional<AnioLectivo> findByAnio(Integer anio);
}
