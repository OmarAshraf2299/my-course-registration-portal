package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class SectionsVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Instructor ID is required")
    private Long instructorId;

    @NotBlank(message = "Semester is required")
    private String semester;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String room;
    private String schedule;
}
