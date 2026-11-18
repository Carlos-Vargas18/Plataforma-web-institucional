package com.educonnect.repository;

import com.educonnect.model.CodigoRecuperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodigoRecuperacionRepository extends JpaRepository<CodigoRecuperacion, Long> {
    List<CodigoRecuperacion> findByEmailAndUsadoFalseOrderByFechaCreacionDesc(String email);
    Optional<CodigoRecuperacion> findFirstByEmailAndUsadoFalseOrderByFechaCreacionDesc(String email);
}
