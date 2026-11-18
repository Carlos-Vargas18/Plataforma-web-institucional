package com.educonnect.repository;

import com.educonnect.model.BitacoraMipa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BitacoraMipaRepository extends JpaRepository<BitacoraMipa, Long> {
    List<BitacoraMipa> findAllByOrderByIndiceRiesgoDesc();
    Optional<BitacoraMipa> findFirstByMatricula_IdOrderByFechaCalculoDesc(Long matriculaId);
}
