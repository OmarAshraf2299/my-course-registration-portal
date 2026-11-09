package io.khadijah.smartcoursehub;

import io.khadijah.smartcoursehub.config.DataInitializer;
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
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class WeeklySessionRegressionTest {
    @MockitoBean DataInitializer initializer;
    @Autowired AttendanceService service;
    @Autowired SectionsRepository sections;
    @Autowired ClassSessionRepository sessions;
    @Autowired UsersRepository users;
    private Sections section;
    private static final LocalDate START = LocalDate.of(2026, 11, 9);

    @BeforeEach
    void fixture() {
        Users teacher = users.save(Users.builder().name("M3 Teacher").email("m3-week-" + java.util.UUID.randomUUID() + "@example.test")
                .password("unused-synthetic-hash").role("INSTRUCTOR").enabled(true).build());
        section = sections.save(Sections.builder().courseId(1L).instructorId(teacher.getId())
                .semester("M3 Test").capacity(10).build());
    }

    @Test
    void initialGenerationCreatesTwoScheduledSessions() {
        List<ClassSession> result = service.generateWeeklySessions(section.getId(), START);
        assertThat(result).extracting(ClassSession::getSessionDate).containsExactly(START, START.plusDays(2));
        assertThat(result).allSatisfy(s -> {
            assertThat(s.getStartTime()).isEqualTo(LocalTime.of(9, 0));
            assertThat(s.getDurationMinutes()).isEqualTo(90);
        });
        assertThat(sessions.findBySectionId(section.getId())).hasSize(2);
    }

    @Test
    void repeatsReuseIdsAndAnotherWeekCreatesNewRows() {
        List<Long> first = ids(service.generateWeeklySessions(section.getId(), START));
        assertThat(ids(service.generateWeeklySessions(section.getId(), START))).isEqualTo(first);
        service.generateWeeklySessions(section.getId(), START.plusWeeks(1));
        assertThat(sessions.findBySectionId(section.getId())).hasSize(4);
    }

    @Test
    void partialWeekAndDifferentStartTimesPreserveExistingSessions() {
        ClassSession existing = sessions.save(ClassSession.builder().section(section).sessionDate(START)
                .startTime(LocalTime.of(9, 0)).durationMinutes(75).topic("Preserved topic").build());
        sessions.save(ClassSession.builder().section(section).sessionDate(START)
                .startTime(LocalTime.of(14, 0)).durationMinutes(60).build());
        List<ClassSession> result = service.generateWeeklySessions(section.getId(), START);
        assertThat(result.get(0).getId()).isEqualTo(existing.getId());
        assertThat(result.get(0).getTopic()).isEqualTo("Preserved topic");
        assertThat(result.get(0).getDurationMinutes()).isEqualTo(75);
        assertThat(sessions.findBySectionId(section.getId())).hasSize(3);
    }

    @Test
    void historicalDuplicatesArePreservedWithoutAddingMore() {
        for (int i = 0; i < 2; i++) sessions.save(ClassSession.builder().section(section).sessionDate(START)
                .startTime(LocalTime.of(9, 0)).durationMinutes(90).build());
        List<Long> original = ids(sessions.findBySectionId(section.getId()));
        assertThat(service.generateWeeklySessions(section.getId(), START).get(0).getId())
                .isEqualTo(original.stream().min(Long::compareTo).orElseThrow());
        assertThat(ids(sessions.findBySectionId(section.getId()))).containsAll(original).hasSize(3);
        service.generateWeeklySessions(section.getId(), START);
        assertThat(sessions.findBySectionId(section.getId())).hasSize(3);
    }

    @Test
    void concurrentGenerationCreatesOnlyOnePair() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        CountDownLatch ready = new CountDownLatch(4), start = new CountDownLatch(1);
        try {
            List<Future<List<Long>>> requests = new java.util.ArrayList<>();
            for (int i = 0; i < 4; i++) requests.add(pool.submit(() -> {
                ready.countDown();
                if (!start.await(10, TimeUnit.SECONDS)) throw new AssertionError("start timeout");
                return ids(service.generateWeeklySessions(section.getId(), START));
            }));
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            List<Long> expected = requests.get(0).get(20, TimeUnit.SECONDS);
            for (Future<List<Long>> request : requests) assertThat(request.get(20, TimeUnit.SECONDS)).isEqualTo(expected);
            assertThat(sessions.findBySectionId(section.getId())).hasSize(2);
        } finally {
            start.countDown();
            pool.shutdownNow();
        }
    }

    @Test
    void missingSectionDoesNotInsertSessions() {
        long before = sessions.count();
        assertThatThrownBy(() -> service.generateWeeklySessions(Long.MAX_VALUE, START)).isInstanceOf(NoSuchElementException.class);
        assertThat(sessions.count()).isEqualTo(before);
    }

    private List<Long> ids(List<ClassSession> rows) {
        return rows.stream().map(ClassSession::getId).toList();
    }
}
