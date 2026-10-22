package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;


@Data
public class SubmissionsVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "id can not null")
    private Long id;

    @NotNull(message = "assignmentId can not null")
    private Long assignmentId;

    @NotNull(message = "studentId can not null")
    private Long studentId;

    private Integer obtainedMarks;

    private Date submittedAt;

    private String attachmentUrl;

}
