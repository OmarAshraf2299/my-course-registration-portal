package io.khadijah.smartcoursehub.repository;

import io.khadijah.smartcoursehub.entity.Submissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmissionsRepository extends JpaRepository<Submissions, Long>, JpaSpecificationExecutor<Submissions> {

    List<Submissions> findByAssignmentId(Long assignmentId);

    List<Submissions> findByStudentId(Long studentId);

    Optional<Submissions> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    @Query("SELECT s FROM Submissions s WHERE s.assignmentId IN :assignmentIds AND s.studentId = :studentId")
    List<Submissions> findByAssignmentIdsAndStudentId(@Param("assignmentIds") List<Long> assignmentIds, @Param("studentId") Long studentId);
}
