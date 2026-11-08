package com.educonnect.service;

import com.educonnect.dto.DashboardStatsDto;
import com.educonnect.model.*;
import com.educonnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final DocenteRepository docenteRepository;
    private final TutorRepository tutorRepository;
    private final MateriaRepository materiaRepository;
    private final GrupoRepository grupoRepository;
    private final MatriculaRepository matriculaRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto obtenerEstadisticas() {
        return DashboardStatsDto.builder()
                .totalEstudiantes(usuarioRepository.countByRol(Rol.ESTUDIANTE))
                .totalDocentes(usuarioRepository.countByRol(Rol.DOCENTE))
                .totalTutores(tutorRepository.count())
                .totalMaterias(materiaRepository.count())
                .totalGrupos(grupoRepository.count())
                .totalMatriculasActivas(matriculaRepository.count())
                .build();
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Materia> listarMaterias() {
        return materiaRepository.findAll();
    }

    @Transactional
    public Materia crearMateria(Materia materia) {
        return materiaRepository.save(materia);
    }

    @Transactional
    public void eliminarMateria(Long id) {
        materiaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Grupo> listarGrupos() {
        return grupoRepository.findAll();
    }
}
