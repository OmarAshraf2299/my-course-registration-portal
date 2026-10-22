package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class AssignmentsVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Section ID is required")
    private Long sectionId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Total marks is required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;

    @NotNull(message = "Deadline is required")
    private Date deadline;
}
