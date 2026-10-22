package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class GradeRecordDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long studentId;
    private Integer obtainedMarks;
}
