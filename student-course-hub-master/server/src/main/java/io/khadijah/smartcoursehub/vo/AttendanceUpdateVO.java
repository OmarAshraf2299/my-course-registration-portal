package io.khadijah.smartcoursehub.vo;


import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = false)
public class AttendanceUpdateVO extends AttendanceVO implements Serializable {
    private static final long serialVersionUID = 1L;

}
