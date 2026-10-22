package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class EnrollmentsDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long studentId;
    private String studentName;
    private Long sectionId;
    private String courseCode;
    private String courseTitle;
    private String instructorName;
    private String semester;
    private String schedule;
    private String room;
    private String status;
}
