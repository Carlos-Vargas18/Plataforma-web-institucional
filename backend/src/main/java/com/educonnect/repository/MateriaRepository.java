package com.educonnect.repository;

import com.educonnect.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Long> {
    Optional<Materia> findByCodigoOficial(String codigoOficial);
}
