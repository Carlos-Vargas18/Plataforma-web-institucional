package com.educonnect.repository;

import com.educonnect.model.Grado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GradoRepository extends JpaRepository<Grado, Long> {
    Optional<Grado> findByNombre(String nombre);
}
