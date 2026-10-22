package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class SectionsDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private Long instructorId;
    private String instructorName;
    private String semester;
    private Integer capacity;
    private Integer enrolledCount;
    private Integer availableSeats;
    private String room;
    private String schedule;
}
