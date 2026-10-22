package io.khadijah.smartcoursehub.vo;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Data
public class EnrollmentsVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Section ID is required")
    private Long sectionId;
}
