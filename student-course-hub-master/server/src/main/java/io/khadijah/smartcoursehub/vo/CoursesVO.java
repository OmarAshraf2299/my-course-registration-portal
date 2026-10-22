package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.io.Serializable;

@Data
public class CoursesVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Course code is required")
    private String code;

    @NotBlank(message = "Course title is required")
    private String title;

    private String description;

    @NotNull(message = "Credit hours is required")
    @Min(value = 1, message = "Credit hours must be at least 1")
    private Integer creditHours;
}
