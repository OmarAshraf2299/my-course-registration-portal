package io.khadijah.smartcoursehub.dto;


import lombok.Data;

import java.io.Serializable;

@Data
public class CoursesDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    private String code;

    private String title;

    private String description;

    private Integer creditHours;

}
