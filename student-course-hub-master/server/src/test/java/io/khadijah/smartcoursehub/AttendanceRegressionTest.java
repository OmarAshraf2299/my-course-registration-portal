package io.khadijah.smartcoursehub;

import io.khadijah.smartcoursehub.config.DataInitializer;
import io.khadijah.smartcoursehub.dto.AttendanceRecordDTO;
import io.khadijah.smartcoursehub.dto.AttendanceSummaryDTO;
import io.khadijah.smartcoursehub.entity.*;
import io.khadijah.smartcoursehub.repository.*;
import io.khadijah.smartcoursehub.service.AttendanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class AttendanceRegressionTest {
    @MockitoBean DataInitializer initializer;
    @Autowired AttendanceService service;
    @Autowired AttendanceRepository attendance;
    @Autowired ClassSessionRepository sessions;
    @Autowired SectionsRepository sections;
    @Autowired CoursesRepository courses;
    @Autowired UsersRepository users;
    @Autowired EnrollmentsRepository enrollments;

    private Users teacher;
    private Users student;
    private Sections section;
    private ClassSession session;

    @BeforeEach
    void fixture() {
        teacher = user("INSTRUCTOR");
        student = user("STUDENT");
        Courses course = courses.save(Courses.builder().code("M3-" + UUID.randomUUID())
                .title("M3 Synthetic Attendance Course").creditHours(3).build());
        section = sections.save(Sections.builder().courseId(course.getId()).instructorId(teacher.getId())
                .semester("M3 Test").capacity(10).build());
        enroll(student);
        session = newSession(LocalDate.of(2026, 11, 9));
    }

    @Test
    void repeatedMarkingKeepsOneRecordAndItsId() {
        mark("PRESENT");
        Long originalId = rows().get(0).getId();
        mark("PRESENT");
        mark("PRESENT");
        assertThat(rows()).hasSize(1);
        assertThat(rows().get(0).getId()).isEqualTo(originalId);
        assertSummary(1, 1, 0, 100.0);
    }

    @Test
    void allStatusUpdatesPreserveIdAndCorrectSummary() {
        mark("PRESENT");
        Long originalId = rows().get(0).getId();
        for (AttendanceStatus status : AttendanceStatus.values()) {
            mark(status.name());
            assertThat(rows()).hasSize(1);
            assertThat(rows().get(0).getId()).isEqualTo(originalId);
            assertThat(rows().get(0).getStatus()).isEqualTo(status);
            boolean present = status == AttendanceStatus.PRESENT || status == AttendanceStatus.LATE;
            assertSummary(1, present ? 1 : 0, present ? 0 : 1, present ? 100.0 : 0.0);
        }
    }

    @Test
    void repeatedStudentWithinOneBatchUsesLastExplicitStatus() {
        service.markAttendance(session.getId(), List.of(record(student.getId(), "PRESENT"),
                record(student.getId(), "ABSENT"), record(student.getId(), "LATE")), teacher.getId());
        assertThat(rows()).hasSize(1);
        assertThat(rows().get(0).getStatus()).isEqualTo(AttendanceStatus.LATE);
        assertSummary(1, 1, 0, 100.0);
    }

    @Test
    void emptyBatchDoesNotCreateOrChangeAttendance() {
        service.markAttendance(session.getId(), List.of(), teacher.getId());
        assertThat(rows()).isEmpty();
        assertSummary(0, 0, 0, 0.0);
        mark("ABSENT");
        Long originalId = rows().get(0).getId();
        service.markAttendance(session.getId(), List.of(), teacher.getId());
        assertThat(rows()).hasSize(1);
        assertThat(rows().get(0).getId()).isEqualTo(originalId);
        assertSummary(1, 0, 1, 0.0);
    }

    @Test
    void nullBatchAndMalformedRecordsFailWithoutWrites() {
        assertThatThrownBy(() -> service.markAttendance(session.getId(), null, teacher.getId()))
                .isInstanceOf(IllegalStateException.class);
        List<List<AttendanceRecordDTO>> malformed = List.of(
                Arrays.asList((AttendanceRecordDTO) null),
                List.of(record(null, "PRESENT")),
                List.of(record(student.getId(), null)),
                List.of(record(student.getId(), "")),
                List.of(record(student.getId(), "UNKNOWN")),
                List.of(record(student.getId(), "present")));
        for (List<AttendanceRecordDTO> records : malformed) {
            assertThatThrownBy(() -> service.markAttendance(session.getId(), records, teacher.getId()))
                    .isInstanceOf(IllegalStateException.class);
            assertThat(rows()).isEmpty();
        }
    }

    @Test
    void missingSessionAndWrongInstructorCannotWrite() {
        long originalCount = attendance.count();
        assertThatThrownBy(() -> service.markAttendance(Long.MAX_VALUE,
                List.of(record(student.getId(), "PRESENT")), teacher.getId()))
                .isInstanceOf(NoSuchElementException.class);
        assertThatThrownBy(() -> service.markAttendance(session.getId(),
                List.of(record(student.getId(), "PRESENT")), student.getId()))
                .isInstanceOf(IllegalStateException.class);
        assertThat(rows()).isEmpty();
        assertThat(attendance.count()).isEqualTo(originalCount);
    }

    @Test
    void unenrolledAndUnknownStudentsAreRejected() {
        Users outsider = user("STUDENT");
        for (Long studentId : List.of(outsider.getId(), Long.MAX_VALUE)) {
            assertThatThrownBy(() -> service.markAttendance(session.getId(),
                    List.of(record(studentId, "PRESENT")), teacher.getId()))
                    .isInstanceOf(IllegalStateException.class);
            assertThat(rows()).isEmpty();
        }
    }

    @Test
    void invalidLaterRecordRollsBackEntireBatch() {
        assertThatThrownBy(() -> service.markAttendance(session.getId(),
                List.of(record(student.getId(), "PRESENT"), record(student.getId(), "UNKNOWN")), teacher.getId()))
                .isInstanceOf(IllegalStateException.class);
        assertThat(rows()).isEmpty();
        mark("PRESENT");
        Long originalId = rows().get(0).getId();
        assertThatThrownBy(() -> service.markAttendance(session.getId(),
                List.of(record(student.getId(), "ABSENT"), record(Long.MAX_VALUE, "PRESENT")), teacher.getId()))
                .isInstanceOf(IllegalStateException.class);
        assertThat(rows()).hasSize(1);
        assertThat(rows().get(0).getId()).isEqualTo(originalId);
        assertThat(rows().get(0).getStatus()).isEqualTo(AttendanceStatus.PRESENT);
    }

    @Test
    void concurrentFirstMarkingCreatesOneRecord() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        CountDownLatch ready = new CountDownLatch(4), start = new CountDownLatch(1);
        try {
            List<Future<Void>> requests = new ArrayList<>();
            for (int i = 0; i < 4; i++) requests.add(pool.submit(() -> {
                ready.countDown();
                if (!start.await(10, TimeUnit.SECONDS)) throw new AssertionError("start timeout");
                mark("PRESENT");
                return null;
            }));
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            for (Future<Void> request : requests) request.get(20, TimeUnit.SECONDS);
            assertThat(rows()).hasSize(1);
            assertSummary(1, 1, 0, 100.0);
        } finally {
            start.countDown();
            pool.shutdownNow();
        }
    }

    @Test
    void identicalHistoricalDuplicatesCountOnceAndRemarkPreservesIds() {
        legacy(AttendanceStatus.PRESENT);
        legacy(AttendanceStatus.PRESENT);
        List<Long> originalIds = rows().stream().map(Attendance::getId).toList();
        assertSummary(1, 1, 0, 100.0);
        mark("ABSENT");
        assertThat(rows()).extracting(Attendance::getId).containsExactlyInAnyOrderElementsOf(originalIds);
        assertThat(rows()).allSatisfy(row -> assertThat(row.getStatus()).isEqualTo(AttendanceStatus.ABSENT));
        assertSummary(1, 0, 1, 0.0);
    }

    @Test
    void conflictingHistoricalStatusesNeedExplicitInstructorRemark() {
        legacy(AttendanceStatus.PRESENT);
        legacy(AttendanceStatus.ABSENT);
        List<Long> originalIds = rows().stream().map(Attendance::getId).toList();
        assertThatThrownBy(() -> service.getStudentAttendanceSummary(student.getId()))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Conflicting");
        assertThat(rows()).extracting(Attendance::getStatus)
                .containsExactlyInAnyOrder(AttendanceStatus.PRESENT, AttendanceStatus.ABSENT);
        mark("LATE");
        assertThat(rows()).extracting(Attendance::getId).containsExactlyInAnyOrderElementsOf(originalIds);
        assertThat(rows()).allSatisfy(row -> assertThat(row.getStatus()).isEqualTo(AttendanceStatus.LATE));
        assertSummary(1, 1, 0, 100.0);
    }

    @Test
    void studentsAndSessionsRemainIndependent() {
        Users otherStudent = user("STUDENT");
        enroll(otherStudent);
        ClassSession otherSession = newSession(LocalDate.of(2026, 11, 11));
        service.markAttendance(session.getId(), List.of(record(student.getId(), "PRESENT"),
                record(otherStudent.getId(), "ABSENT")), teacher.getId());
        service.markAttendance(otherSession.getId(), List.of(record(student.getId(), "LEAVE"),
                record(otherStudent.getId(), "LATE")), teacher.getId());
        mark("ABSENT");
        assertThat(rows()).hasSize(2);
        assertThat(attendance.findBySessionId(otherSession.getId())).hasSize(2);
        assertSummary(2, 0, 2, 0.0);
        AttendanceSummaryDTO otherSummary = summary(otherStudent.getId());
        assertThat(otherSummary.getTotalClasses()).isEqualTo(2L);
        assertThat(otherSummary.getPresentCount()).isEqualTo(1L);
        assertThat(otherSummary.getAbsentCount()).isEqualTo(1L);
        assertThat(otherSummary.getAttendancePercentage()).isEqualTo(50.0);
    }

    private Users user(String role) {
        return users.save(Users.builder().name("M3 Synthetic " + role).email("m3-attendance-" + UUID.randomUUID() + "@example.test")
                .password("unused-synthetic-hash").role(role).enabled(true).build());
    }

    private void enroll(Users enrolledStudent) {
        enrollments.save(Enrollments.builder().studentId(enrolledStudent.getId()).sectionId(section.getId())
                .status("ENROLLED").build());
    }

    private ClassSession newSession(LocalDate date) {
        return sessions.save(ClassSession.builder().section(section).sessionDate(date).startTime(LocalTime.of(9, 0))
                .durationMinutes(90).createdByTeacher(teacher).build());
    }

    private AttendanceRecordDTO record(Long studentId, String status) {
        AttendanceRecordDTO result = new AttendanceRecordDTO();
        result.setStudentId(studentId);
        result.setStatus(status);
        return result;
    }

    private void mark(String status) {
        service.markAttendance(session.getId(), List.of(record(student.getId(), status)), teacher.getId());
    }

    private List<Attendance> rows() {
        return attendance.findBySessionId(session.getId());
    }

    private void legacy(AttendanceStatus status) {
        attendance.save(Attendance.builder().session(session).student(student).status(status).build());
    }

    private AttendanceSummaryDTO summary(Long studentId) {
        return service.getStudentAttendanceSummary(studentId).stream()
                .filter(value -> value.getSectionId().equals(section.getId())).findFirst().orElseThrow();
    }

    private void assertSummary(long total, long present, long absent, double percentage) {
        AttendanceSummaryDTO value = summary(student.getId());
        assertThat(value.getTotalClasses()).isEqualTo(total);
        assertThat(value.getPresentCount()).isEqualTo(present);
        assertThat(value.getAbsentCount()).isEqualTo(absent);
        assertThat(value.getAttendancePercentage()).isEqualTo(percentage);
    }
}
