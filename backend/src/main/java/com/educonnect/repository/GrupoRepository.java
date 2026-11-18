package com.educonnect.repository;

import com.educonnect.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    List<Grupo> findByAnioLectivo_Id(Long anioLectivoId);
    Optional<Grupo> findByDirectorGrupo_Id(Long docenteId);
    Optional<Grupo> findByDirectorGrupo_Usuario_Id(Long usuarioId);
    Optional<Grupo> findByCodigoGrupo(String codigoGrupo);
}
