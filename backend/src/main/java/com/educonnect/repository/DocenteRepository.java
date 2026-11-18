package com.educonnect.repository;

import com.educonnect.model.Docente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocenteRepository extends JpaRepository<Docente, Long> {
    Optional<Docente> findByUsuarioId(Long usuarioId);
    Optional<Docente> findByUsuario_Id(Long usuarioId);
    Optional<Docente> findByCodigoEmpleado(String codigoEmpleado);
}
