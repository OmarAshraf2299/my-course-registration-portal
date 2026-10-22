package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.EnrollmentsDTO;
import io.khadijah.smartcoursehub.entity.Enrollments;
import io.khadijah.smartcoursehub.entity.Sections;
import io.khadijah.smartcoursehub.repository.CoursesRepository;
import io.khadijah.smartcoursehub.repository.EnrollmentsRepository;
import io.khadijah.smartcoursehub.repository.SectionsRepository;
import io.khadijah.smartcoursehub.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnrollmentsService {

    @Autowired
    private EnrollmentsRepository enrollmentsRepository;

    @Autowired
    private SectionsRepository sectionsRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Transactional
    public Long enroll(Long studentId, Long sectionId) {
        // Validate section exists
        Sections section = sectionsRepository.findById(sectionId)
                .orElseThrow(() -> new NoSuchElementException("Section not found: " + sectionId));

        // Check if student is already enrolled in ANY section of this course
        if (enrollmentsRepository.existsByStudentIdAndCourseIdAndStatus(studentId, section.getCourseId(), "ENROLLED")) {
            throw new IllegalStateException("You are already enrolled in a section for this course.");
        }

        // Check if student is already enrolled in this section (specific check for re-enrollment logic)
        Optional<Enrollments> existingEnrollment = enrollmentsRepository.findByStudentIdAndSectionId(studentId, sectionId);
        if (existingEnrollment.isPresent()) {
            if (existingEnrollment.get().getStatus().equals("ENROLLED")) {
                throw new IllegalStateException("You are already enrolled in this section");
            } else if (existingEnrollment.get().getStatus().equals("DROPPED")) {
                // Re-enroll
                Enrollments enrollment = existingEnrollment.get();
                // Check capacity before re-enrollment
                Long enrolledCount = enrollmentsRepository.countEnrolledBySection(sectionId);
                if (enrolledCount >= section.getCapacity()) {
                    throw new IllegalStateException("Section full. Please select a different section.");
                }
                enrollment.setStatus("ENROLLED");
                enrollment = enrollmentsRepository.save(enrollment);
                return enrollment.getId();
            }
        }

        // Check capacity
        Long enrolledCount = enrollmentsRepository.countEnrolledBySection(sectionId);
        if (enrolledCount >= section.getCapacity()) {
            throw new IllegalStateException("Section full. Please select a different section.");
        }

        // Create enrollment
        Enrollments enrollment = Enrollments.builder()
                .studentId(studentId)
                .sectionId(sectionId)
                .status("ENROLLED")
                .build();

        enrollment = enrollmentsRepository.save(enrollment);
        return enrollment.getId();
    }

    @Transactional
    public void drop(Long studentId, Long enrollmentId) {
        Enrollments enrollment = enrollmentsRepository.findById(enrollmentId)
                .orElseThrow(() -> new NoSuchElementException("Enrollment not found: " + enrollmentId));

        // Verify this enrollment belongs to the student
        if (!enrollment.getStudentId().equals(studentId)) {
            throw new IllegalStateException("This enrollment does not belong to you");
        }

        if (enrollment.getStatus().equals("DROPPED")) {
            throw new IllegalStateException("You have already dropped this course");
        }

        enrollment.setStatus("DROPPED");
        enrollmentsRepository.save(enrollment);
    }

    public EnrollmentsDTO getById(Long id) {
        Enrollments enrollment = enrollmentsRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Enrollment not found: " + id));
        return toDTO(enrollment);
    }

    public List<EnrollmentsDTO> getByStudentId(Long studentId) {
        return enrollmentsRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EnrollmentsDTO> getActiveByStudentId(Long studentId) {
        return enrollmentsRepository.findByStudentIdAndStatus(studentId, "ENROLLED").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EnrollmentsDTO> getBySectionId(Long sectionId) {
        return enrollmentsRepository.findBySectionId(sectionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EnrollmentsDTO> getEnrolledBySectionId(Long sectionId) {
        return enrollmentsRepository.findBySectionIdAndStatus(sectionId, "ENROLLED").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private EnrollmentsDTO toDTO(Enrollments enrollment) {
        EnrollmentsDTO dto = new EnrollmentsDTO();
        dto.setId(enrollment.getId());
        dto.setStudentId(enrollment.getStudentId());
        dto.setSectionId(enrollment.getSectionId());
        dto.setStatus(enrollment.getStatus());

        // Fetch student name
        usersRepository.findById(enrollment.getStudentId()).ifPresent(student -> {
            dto.setStudentName(student.getName());
        });

        // Fetch section and course details
        sectionsRepository.findById(enrollment.getSectionId()).ifPresent(section -> {
            dto.setSemester(section.getSemester());
            dto.setSchedule(section.getSchedule());
            dto.setRoom(section.getRoom());

            // Fetch course details
            coursesRepository.findById(section.getCourseId()).ifPresent(course -> {
                dto.setCourseCode(course.getCode());
                dto.setCourseTitle(course.getTitle());
            });

            // Fetch instructor name
            usersRepository.findById(section.getInstructorId()).ifPresent(instructor -> {
                dto.setInstructorName(instructor.getName());
            });
        });

        return dto;
    }
}
