package io.khadijah.smartcoursehub.vo;


import lombok.Data;

import java.io.Serializable;
import java.sql.Date;

@Data
public class AttendanceQueryVO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long id;

    private Long sectionId;

    private Long studentId;

    private Date attendanceDate;

    private Integer present;

}
