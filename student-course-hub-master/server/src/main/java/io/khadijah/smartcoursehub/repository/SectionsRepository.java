package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Sections;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SectionsRepository extends JpaRepository<Sections, Long>, JpaSpecificationExecutor<Sections> {

    List<Sections> findByCourseId(Long courseId);

    List<Sections> findByInstructorId(Long instructorId);

    List<Sections> findBySemester(String semester);

    boolean existsByCourseId(Long courseId);

    @Query("SELECT s FROM Sections s WHERE s.instructorId = :instructorId AND s.semester = :semester")
    List<Sections> findByInstructorAndSemester(@Param("instructorId") Long instructorId, @Param("semester") String semester);
}
