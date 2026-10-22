package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.CoursesDTO;
import io.khadijah.smartcoursehub.entity.Courses;
import io.khadijah.smartcoursehub.repository.CoursesRepository;
import io.khadijah.smartcoursehub.repository.SectionsRepository;
import io.khadijah.smartcoursehub.vo.CoursesUpdateVO;
import io.khadijah.smartcoursehub.vo.CoursesVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class CoursesService {

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private SectionsRepository sectionsRepository;

    @Transactional
    public Long save(CoursesVO vO) {
        // Check if course code already exists
        if (coursesRepository.existsByCode(vO.getCode())) {
            throw new IllegalStateException("Course code already exists");
        }

        Courses course = new Courses();
        BeanUtils.copyProperties(vO, course);
        course = coursesRepository.save(course);
        return course.getId();
    }

    @Transactional
    public void delete(Long id) {
        Courses course = requireOne(id);

        // Check if course is used by any section
        if (sectionsRepository.existsByCourseId(id)) {
            throw new IllegalStateException("Course is in use and cannot be deleted");
        }

        coursesRepository.delete(course);
    }

    @Transactional
    public void update(Long id, CoursesUpdateVO vO) {
        Courses course = requireOne(id);

        if (vO.getCode() != null && !vO.getCode().isEmpty()) {
            // Check if new code is different and already exists
            if (!course.getCode().equals(vO.getCode()) && coursesRepository.existsByCode(vO.getCode())) {
                throw new IllegalStateException("Course code already exists");
            }
            course.setCode(vO.getCode());
        }

        if (vO.getTitle() != null && !vO.getTitle().isEmpty()) {
            course.setTitle(vO.getTitle());
        }

        if (vO.getDescription() != null) {
            course.setDescription(vO.getDescription());
        }

        if (vO.getCreditHours() != null) {
            course.setCreditHours(vO.getCreditHours());
        }

        coursesRepository.save(course);
    }

    public CoursesDTO getById(Long id) {
        Courses original = requireOne(id);
        return toDTO(original);
    }

    public List<CoursesDTO> getAll() {
        return coursesRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CoursesDTO toDTO(Courses original) {
        CoursesDTO dto = new CoursesDTO();
        BeanUtils.copyProperties(original, dto);
        return dto;
    }

    private Courses requireOne(Long id) {
        return coursesRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Course not found: " + id));
    }
}
