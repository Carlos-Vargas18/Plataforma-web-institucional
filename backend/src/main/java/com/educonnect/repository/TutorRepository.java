package com.educonnect.repository;

import com.educonnect.model.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {
    Optional<Tutor> findByNumeroDocumento(String numeroDocumento);
    Optional<Tutor> findByUsuarioId(Long usuarioId);
}
