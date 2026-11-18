package com.educonnect.repository;

import com.educonnect.model.EstudianteTutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstudianteTutorRepository extends JpaRepository<EstudianteTutor, Long> {
    List<EstudianteTutor> findByTutor_Id(Long tutorId);
    List<EstudianteTutor> findByTutor_Usuario_Id(Long usuarioId);
    List<EstudianteTutor> findByEstudiante_Id(Long estudianteId);
    boolean existsByTutor_Usuario_IdAndEstudiante_Id(Long tutorUsuarioId, Long estudianteId);
}
