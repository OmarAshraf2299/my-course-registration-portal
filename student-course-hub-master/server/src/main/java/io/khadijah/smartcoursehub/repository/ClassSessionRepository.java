package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findBySectionId(Long sectionId);
}
