package io.khadijah.smartcoursehub.vo;


import lombok.Data;

import java.io.Serializable;

@Data
public class EnrollmentsQueryVO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    private Long studentId;

    private Long sectionId;

    private String status;

}
