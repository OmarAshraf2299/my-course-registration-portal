package io.khadijah.smartcoursehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceSummaryDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long sectionId;
    private String courseCode;
    private String courseTitle;
    private Long totalClasses;
    private Long presentCount;
    private Long absentCount;
    private Double attendancePercentage;
}