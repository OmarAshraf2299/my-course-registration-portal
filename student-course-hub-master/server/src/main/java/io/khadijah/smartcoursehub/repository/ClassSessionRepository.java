package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findBySectionId(Long sectionId);

    Optional<ClassSession> findFirstBySectionIdAndSessionDateAndStartTimeOrderByIdAsc(
            Long sectionId, LocalDate sessionDate, LocalTime startTime);
}
