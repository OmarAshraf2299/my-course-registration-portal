package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.io.Serializable;

@Data
public class CoursesUpdateVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String code;
    private String title;
    private String description;

    @Min(value = 1, message = "Credit hours must be at least 1")
    private Integer creditHours;
}
