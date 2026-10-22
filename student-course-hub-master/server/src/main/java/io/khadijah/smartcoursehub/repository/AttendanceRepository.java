package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Attendance;
import io.khadijah.smartcoursehub.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {

    List<Attendance> findBySessionId(Long sessionId);

    List<Attendance> findByStudentId(Long studentId);

    // Replaces findBySectionId
    List<Attendance> findBySession_SectionId(Long sectionId);
    
    // Replaces findByStudentIdAndSectionId
    List<Attendance> findByStudentIdAndSession_SectionId(Long studentId, Long sectionId);

    boolean existsBySessionIdAndStudentId(Long sessionId, Long studentId);

    Optional<Attendance> findBySessionIdAndStudentId(Long sessionId, Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.session.section.id = :sectionId AND a.status = :status")
    Long countByStudentAndSectionAndStatus(@Param("studentId") Long studentId, @Param("sectionId") Long sectionId, @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.session.section.id = :sectionId")
    Long countTotalByStudentAndSection(@Param("studentId") Long studentId, @Param("sectionId") Long sectionId);
}