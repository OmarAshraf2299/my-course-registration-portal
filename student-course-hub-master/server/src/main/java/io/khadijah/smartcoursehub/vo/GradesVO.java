package io.khadijah.smartcoursehub.vo;

import io.khadijah.smartcoursehub.dto.GradeRecordDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class GradesVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;

    @NotNull(message = "Grades records are required")
    private List<GradeRecordDTO> grades;
}
