package io.khadijah.smartcoursehub.vo;


import lombok.Data;

import java.io.Serializable;

@Data
public class SectionsQueryVO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    private Long courseId;

    private Long instructorId;

    private String semester;

    private Integer capacity;

    private String room;

    private String schedule;

}
