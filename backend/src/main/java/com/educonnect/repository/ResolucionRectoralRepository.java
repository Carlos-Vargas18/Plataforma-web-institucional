package com.educonnect.repository;

import com.educonnect.model.ResolucionRectoral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResolucionRectoralRepository extends JpaRepository<ResolucionRectoral, Long> {
    List<ResolucionRectoral> findAllByOrderByFechaEmisionDesc();
}
