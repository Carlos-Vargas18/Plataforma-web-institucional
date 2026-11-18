package com.educonnect.repository;

import com.educonnect.model.HorarioEscolar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioEscolarRepository extends JpaRepository<HorarioEscolar, Long> {
    List<HorarioEscolar> findByGrupo_IdOrderByBloqueOrdenAsc(Long grupoId);
    List<HorarioEscolar> findByGrupo_CodigoGrupoOrderByBloqueOrdenAsc(String codigoGrupo);
    List<HorarioEscolar> findByDocente_IdOrderByBloqueOrdenAsc(Long docenteId);
    List<HorarioEscolar> findByDocente_Usuario_IdOrderByBloqueOrdenAsc(Long usuarioId);
    boolean existsByAnioLectivo_IdAndGrupo_IdAndDiaSemanaAndBloqueOrden(Long anioId, Long grupoId, String diaSemana, Integer bloqueOrden);
    boolean existsByAnioLectivo_IdAndDocente_IdAndDiaSemanaAndBloqueOrden(Long anioId, Long docenteId, String diaSemana, Integer bloqueOrden);
}
