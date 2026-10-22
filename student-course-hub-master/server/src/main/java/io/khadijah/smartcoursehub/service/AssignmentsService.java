package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.AssignmentsDTO;
import io.khadijah.smartcoursehub.dto.GradeRecordDTO;
import io.khadijah.smartcoursehub.dto.SubmissionsDTO;
import io.khadijah.smartcoursehub.entity.Assignments;
import io.khadijah.smartcoursehub.entity.Enrollments;
import io.khadijah.smartcoursehub.entity.Sections;
import io.khadijah.smartcoursehub.entity.Submissions;
import io.khadijah.smartcoursehub.repository.*;
import io.khadijah.smartcoursehub.entity.*;
import io.khadijah.smartcoursehub.repository.*;
import io.khadijah.smartcoursehub.vo.AssignmentsQueryVO;
import io.khadijah.smartcoursehub.vo.AssignmentsUpdateVO;
import io.khadijah.smartcoursehub.vo.AssignmentsVO;
import io.khadijah.smartcoursehub.vo.GradesVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class AssignmentsService {

    @Autowired
    private AssignmentsRepository assignmentsRepository;

    @Autowired
    private SectionsRepository sectionsRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private SubmissionsRepository submissionsRepository;

    @Autowired
    private EnrollmentsRepository enrollmentsRepository;

    @Autowired
    private UsersRepository usersRepository;

    public Long save(Long instructorId, AssignmentsVO vO) {
        checkSectionOwnership(instructorId, vO.getSectionId());
        Assignments bean = new Assignments();
        BeanUtils.copyProperties(vO, bean);
        bean = assignmentsRepository.save(bean);
        return bean.getId();
    }

    public void delete(Long instructorId, Long id) {
        Assignments assignment = requireOne(id);
        checkSectionOwnership(instructorId, assignment.getSectionId());
        assignmentsRepository.deleteById(id);
    }

    public void update(Long instructorId, Long id, AssignmentsUpdateVO vO) {
        Assignments bean = requireOne(id);
        checkSectionOwnership(instructorId, bean.getSectionId());
        BeanUtils.copyProperties(vO, bean);
        assignmentsRepository.save(bean);
    }

    public AssignmentsDTO getById(Long id) {
        Assignments original = requireOne(id);
        return toDTO(original);
    }

    public List<AssignmentsDTO> getByInstructorId(Long instructorId) {
        return assignmentsRepository.findByInstructorId(instructorId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AssignmentsDTO> getBySectionId(Long sectionId) {
        return assignmentsRepository.findBySectionId(sectionId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SubmissionsDTO> getSubmissionsByAssignment(Long assignmentId) {
        return submissionsRepository.findByAssignmentId(assignmentId)
                .stream()
                .map(this::toSubmissionsDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void recordGrades(Long instructorId, GradesVO vO) {
        Assignments assignment = requireOne(vO.getAssignmentId());
        checkSectionOwnership(instructorId, assignment.getSectionId());

        for (GradeRecordDTO record : vO.getGrades()) {
            Submissions submission = submissionsRepository
                    .findByAssignmentIdAndStudentId(vO.getAssignmentId(), record.getStudentId())
                    .orElseGet(() -> {
                        Submissions newSub = new Submissions();
                        newSub.setAssignmentId(vO.getAssignmentId());
                        newSub.setStudentId(record.getStudentId());
                        newSub.setSubmittedAt(new Date());
                        return newSub;
                    });
            submission.setObtainedMarks(record.getObtainedMarks());
            submissionsRepository.save(submission);
        }
    }

    public List<AssignmentsDTO> getByStudentId(Long studentId) {
        List<Long> sectionIds = enrollmentsRepository.findByStudentIdAndStatus(studentId, "ENROLLED")
                .stream()
                .map(Enrollments::getSectionId)
                .collect(Collectors.toList());

        return assignmentsRepository.findBySectionIdIn(sectionIds)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SubmissionsDTO> getStudentGrades(Long studentId) {
        return submissionsRepository.findByStudentId(studentId)
                .stream()
                .map(this::toSubmissionsDTO)
                .collect(Collectors.toList());
    }

    private void checkSectionOwnership(Long instructorId, Long sectionId) {
        Sections section = sectionsRepository.findById(sectionId)
                .orElseThrow(() -> new NoSuchElementException("Section not found: " + sectionId));
        if (!section.getInstructorId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized: You do not own this section.");
        }
    }

    public Page<AssignmentsDTO> query(AssignmentsQueryVO vO) {
        throw new UnsupportedOperationException();
    }

    private AssignmentsDTO toDTO(Assignments original) {
        AssignmentsDTO bean = new AssignmentsDTO();
        BeanUtils.copyProperties(original, bean);
        
        sectionsRepository.findById(original.getSectionId()).ifPresent(section -> {
            coursesRepository.findById(section.getCourseId()).ifPresent(course -> {
                bean.setCourseCode(course.getCode());
                bean.setCourseTitle(course.getTitle());
            });
        });
        
        return bean;
    }

    private SubmissionsDTO toSubmissionsDTO(Submissions original) {
        SubmissionsDTO bean = new SubmissionsDTO();
        BeanUtils.copyProperties(original, bean);
        
        usersRepository.findById(original.getStudentId()).ifPresent(user -> {
            bean.setStudentName(user.getName());
        });
        
        assignmentsRepository.findById(original.getAssignmentId()).ifPresent(assignment -> {
            bean.setAssignmentTitle(assignment.getTitle());
            bean.setTotalMarks(assignment.getTotalMarks());
            
            sectionsRepository.findById(assignment.getSectionId()).ifPresent(section -> {
                coursesRepository.findById(section.getCourseId()).ifPresent(course -> {
                    bean.setCourseCode(course.getCode());
                    bean.setCourseTitle(course.getTitle());
                });
            });
        });
        
        return bean;
    }

    private Assignments requireOne(Long id) {
        return assignmentsRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Resource not found: " + id));
    }
}
