package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Assignments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentsRepository extends JpaRepository<Assignments, Long>, JpaSpecificationExecutor<Assignments> {

    List<Assignments> findBySectionId(Long sectionId);

    @Query("SELECT a FROM Assignments a JOIN Sections s ON a.sectionId = s.id WHERE s.instructorId = :instructorId")
    List<Assignments> findByInstructorId(@Param("instructorId") Long instructorId);

    List<Assignments> findBySectionIdIn(List<Long> sectionIds);
}