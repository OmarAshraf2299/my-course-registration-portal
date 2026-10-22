package io.khadijah.smartcoursehub.vo;

import io.khadijah.smartcoursehub.dto.AttendanceRecordDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.sql.Date;
import java.util.List;

@Data
public class AttendanceVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Section ID is required")
    private Long sectionId;

    @NotNull(message = "Attendance date is required")
    private Date attendanceDate;

    @NotNull(message = "Attendance records are required")
    private List<AttendanceRecordDTO> records;
}
