package com.educonnect.repository;

import com.educonnect.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    List<Grupo> findByAnioLectivoEsActualTrue();
    List<Grupo> findByGradoId(Long gradoId);
}
