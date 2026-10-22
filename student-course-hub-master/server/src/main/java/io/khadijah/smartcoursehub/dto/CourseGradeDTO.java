package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class CourseGradeDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long sectionId;
    private String courseCode;
    private String courseTitle;
    private Integer creditHours;
    private String semester;
    private Double totalMarksObtained;
    private Double totalMarksPossible;
    private Double percentage;
    private String letterGrade;
    private Double gradePoints;
}
