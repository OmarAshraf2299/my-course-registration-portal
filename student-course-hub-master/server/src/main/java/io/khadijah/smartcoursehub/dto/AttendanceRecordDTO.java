package io.khadijah.smartcoursehub.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class AttendanceRecordDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long studentId;
    private String status; // PRESENT, ABSENT, LATE, LEAVE
}