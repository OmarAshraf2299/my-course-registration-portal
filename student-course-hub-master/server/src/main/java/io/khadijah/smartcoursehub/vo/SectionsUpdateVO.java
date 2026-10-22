package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.io.Serializable;

@Data
public class SectionsUpdateVO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long courseId;
    private Long instructorId;
    private String semester;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String room;
    private String schedule;
}
