package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class AttendanceDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long sessionId;
    private Long sectionId;
    private String courseCode;
    private String courseTitle;
    private Long studentId;
    private String studentName;
    private LocalDate attendanceDate;
    private String status;
}