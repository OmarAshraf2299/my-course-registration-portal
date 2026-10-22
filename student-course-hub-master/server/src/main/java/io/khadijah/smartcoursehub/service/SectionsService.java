package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.SectionsDTO;
import io.khadijah.smartcoursehub.entity.Courses;
import io.khadijah.smartcoursehub.entity.Sections;
import io.khadijah.smartcoursehub.entity.Users;
import io.khadijah.smartcoursehub.repository.CoursesRepository;
import io.khadijah.smartcoursehub.repository.EnrollmentsRepository;
import io.khadijah.smartcoursehub.repository.SectionsRepository;
import io.khadijah.smartcoursehub.repository.UsersRepository;
import io.khadijah.smartcoursehub.vo.SectionsUpdateVO;
import io.khadijah.smartcoursehub.vo.SectionsVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class SectionsService {

    @Autowired
    private SectionsRepository sectionsRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private EnrollmentsRepository enrollmentsRepository;

    @Transactional
    public Long save(SectionsVO vO) {
        // Validate course exists
        Courses course = coursesRepository.findById(vO.getCourseId())
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + vO.getCourseId()));

        // Validate instructor exists and is an instructor
        Users instructor = usersRepository.findById(vO.getInstructorId())
                .orElseThrow(() -> new NoSuchElementException("Instructor not found: " + vO.getInstructorId()));

        if (!instructor.getRole().equals("INSTRUCTOR")) {
            throw new IllegalStateException("User is not an instructor");
        }

        if (!instructor.getEnabled()) {
            throw new IllegalStateException("Instructor is deactivated");
        }

        Sections section = new Sections();
        BeanUtils.copyProperties(vO, section);
        section = sectionsRepository.save(section);
        return section.getId();
    }

    @Transactional
    public void delete(Long id) {
        Sections section = requireOne(id);
        sectionsRepository.delete(section);
    }

    @Transactional
    public void update(Long id, SectionsUpdateVO vO) {
        Sections section = requireOne(id);

        if (vO.getCourseId() != null) {
            coursesRepository.findById(vO.getCourseId())
                    .orElseThrow(() -> new NoSuchElementException("Course not found: " + vO.getCourseId()));
            section.setCourseId(vO.getCourseId());
        }

        if (vO.getInstructorId() != null) {
            Users instructor = usersRepository.findById(vO.getInstructorId())
                    .orElseThrow(() -> new NoSuchElementException("Instructor not found: " + vO.getInstructorId()));
            if (!instructor.getRole().equals("INSTRUCTOR")) {
                throw new IllegalStateException("User is not an instructor");
            }
            section.setInstructorId(vO.getInstructorId());
        }

        if (vO.getSemester() != null && !vO.getSemester().isEmpty()) {
            section.setSemester(vO.getSemester());
        }

        if (vO.getCapacity() != null) {
            // Check if new capacity is valid (not less than current enrollment)
            Long enrolledCount = enrollmentsRepository.countEnrolledBySection(id);
            if (vO.getCapacity() < enrolledCount) {
                throw new IllegalStateException("Cannot reduce capacity below current enrollment count: " + enrolledCount);
            }
            section.setCapacity(vO.getCapacity());
        }

        if (vO.getRoom() != null) {
            section.setRoom(vO.getRoom());
        }

        if (vO.getSchedule() != null) {
            section.setSchedule(vO.getSchedule());
        }

        sectionsRepository.save(section);
    }

    public SectionsDTO getById(Long id) {
        Sections section = requireOne(id);
        return toDTO(section);
    }

    public List<SectionsDTO> getAll() {
        return sectionsRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SectionsDTO> getByCourseId(Long courseId) {
        return sectionsRepository.findByCourseId(courseId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SectionsDTO> getByInstructorId(Long instructorId) {
        return sectionsRepository.findByInstructorId(instructorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SectionsDTO> getBySemester(String semester) {
        return sectionsRepository.findBySemester(semester).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private SectionsDTO toDTO(Sections section) {
        SectionsDTO dto = new SectionsDTO();
        dto.setId(section.getId());
        dto.setCourseId(section.getCourseId());
        dto.setInstructorId(section.getInstructorId());
        dto.setSemester(section.getSemester());
        dto.setCapacity(section.getCapacity());
        dto.setRoom(section.getRoom());
        dto.setSchedule(section.getSchedule());

        // Fetch course details
        coursesRepository.findById(section.getCourseId()).ifPresent(course -> {
            dto.setCourseCode(course.getCode());
            dto.setCourseTitle(course.getTitle());
        });

        // Fetch instructor details
        usersRepository.findById(section.getInstructorId()).ifPresent(instructor -> {
            dto.setInstructorName(instructor.getName());
        });

        // Calculate enrollment counts
        Long enrolledCount = enrollmentsRepository.countEnrolledBySection(section.getId());
        dto.setEnrolledCount(enrolledCount.intValue());
        dto.setAvailableSeats(section.getCapacity() - enrolledCount.intValue());

        return dto;
    }

    private Sections requireOne(Long id) {
        return sectionsRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Section not found: " + id));
    }
}
