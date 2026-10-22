package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
public class SubmissionsDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long studentId;
    private String studentName;
    private Integer obtainedMarks;
    private Integer totalMarks;
    private Date submittedAt;
    private String attachmentUrl;
    private String courseCode;
    private String courseTitle;
}