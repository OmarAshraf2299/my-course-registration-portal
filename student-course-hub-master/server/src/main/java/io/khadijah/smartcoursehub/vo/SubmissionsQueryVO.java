package io.khadijah.smartcoursehub.vo;


import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class SubmissionsQueryVO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    private Long assignmentId;

    private Long studentId;

    private Integer obtainedMarks;

    private Date submittedAt;

    private String attachmentUrl;

}
