package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class AcademicProgressDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long studentId;
    private String studentName;
    private List<CourseGradeDTO> courseGrades;
    private Double overallGPA;
    private Integer totalCredits;
}
