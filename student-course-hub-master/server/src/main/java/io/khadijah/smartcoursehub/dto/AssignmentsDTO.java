package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
public class AssignmentsDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long sectionId;
    private String courseCode;
    private String courseTitle;
    private String title;
    private String description;
    private Integer totalMarks;
    private Date deadline;
}
