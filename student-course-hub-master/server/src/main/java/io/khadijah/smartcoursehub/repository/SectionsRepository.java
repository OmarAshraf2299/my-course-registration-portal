package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Sections;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface SectionsRepository extends JpaRepository<Sections, Long>, JpaSpecificationExecutor<Sections> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Sections s WHERE s.id = :id")
    Optional<Sections> findByIdForUpdate(@Param("id") Long id);

    List<Sections> findByCourseId(Long courseId);

    List<Sections> findByInstructorId(Long instructorId);

    List<Sections> findBySemester(String semester);

    boolean existsByCourseId(Long courseId);

    @Query("SELECT s FROM Sections s WHERE s.instructorId = :instructorId AND s.semester = :semester")
    List<Sections> findByInstructorAndSemester(@Param("instructorId") Long instructorId, @Param("semester") String semester);
}
