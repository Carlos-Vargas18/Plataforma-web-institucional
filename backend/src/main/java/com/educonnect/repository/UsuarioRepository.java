package com.educonnect.repository;

import com.educonnect.model.Rol;
import com.educonnect.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByDocumento(String documento);
    boolean existsByEmail(String email);
    boolean existsByDocumento(String documento);
    List<Usuario> findByRol(Rol rol);
}
