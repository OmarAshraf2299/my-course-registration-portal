package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Enrollments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentsRepository extends JpaRepository<Enrollments, Long>, JpaSpecificationExecutor<Enrollments> {

    List<Enrollments> findByStudentId(Long studentId);

    List<Enrollments> findBySectionId(Long sectionId);

    List<Enrollments> findByStudentIdAndStatus(Long studentId, String status);

    List<Enrollments> findBySectionIdAndStatus(Long sectionId, String status);

    Optional<Enrollments> findByStudentIdAndSectionId(Long studentId, Long sectionId);

    boolean existsByStudentIdAndSectionIdAndStatus(Long studentId, Long sectionId, String status);

    @Query("SELECT COUNT(e) FROM Enrollments e WHERE e.sectionId = :sectionId AND e.status = 'ENROLLED'")
    Long countEnrolledBySection(@Param("sectionId") Long sectionId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM Enrollments e, Sections s WHERE e.sectionId = s.id AND e.studentId = :studentId AND s.courseId = :courseId AND e.status = :status")
    boolean existsByStudentIdAndCourseIdAndStatus(@Param("studentId") Long studentId, @Param("courseId") Long courseId, @Param("status") String status);
}
