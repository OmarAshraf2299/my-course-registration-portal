package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ClassSession s WHERE s.id = :id")
    Optional<ClassSession> findByIdForUpdate(@Param("id") Long id);

    List<ClassSession> findBySectionId(Long sectionId);

    Optional<ClassSession> findFirstBySectionIdAndSessionDateAndStartTimeOrderByIdAsc(
            Long sectionId, LocalDate sessionDate, LocalTime startTime);
}
