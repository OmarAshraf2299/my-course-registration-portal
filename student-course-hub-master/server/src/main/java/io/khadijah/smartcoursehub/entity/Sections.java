package io.khadijah.smartcoursehub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;

@Entity
@Getter
@Setter
@ToString
@SuperBuilder
@NoArgsConstructor
@Table(name = "sections")
public class Sections implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "instructor_id", nullable = false)
    private Long instructorId;

    @Column(name = "semester", nullable = false)
    private String semester;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "room")
    private String room;

    @Column(name = "schedule")
    private String schedule;

}
