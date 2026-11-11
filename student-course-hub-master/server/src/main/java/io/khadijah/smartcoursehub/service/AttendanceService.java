package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.AttendanceDTO;
import io.khadijah.smartcoursehub.dto.AttendanceRecordDTO;
import io.khadijah.smartcoursehub.dto.AttendanceSummaryDTO;
import io.khadijah.smartcoursehub.entity.Attendance;
import io.khadijah.smartcoursehub.entity.AttendanceStatus;
import io.khadijah.smartcoursehub.entity.ClassSession;
import io.khadijah.smartcoursehub.entity.Sections;
import io.khadijah.smartcoursehub.repository.*;
import io.khadijah.smartcoursehub.entity.*;
import io.khadijah.smartcoursehub.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private SectionsRepository sectionsRepository;

    @Autowired
    private EnrollmentsRepository enrollmentsRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Transactional
    public List<ClassSession> generateWeeklySessions(Long sectionId, LocalDate weekStartDate) {
        // Lock the existing parent even when no sessions exist yet. All generators
        // for this section serialize across transactions/application instances.
        Sections section = sectionsRepository.findByIdForUpdate(sectionId)
                .orElseThrow(() -> new NoSuchElementException("Section not found"));

        // Creating 2 sessions for the week
        List<ClassSession> sessions = new ArrayList<>();
        
        // Session 1
        sessions.add(createSessionIfNotExists(section, weekStartDate));

        // Session 2 (+2 days)
        sessions.add(createSessionIfNotExists(section, weekStartDate.plusDays(2)));
        
        return sessions;
    }
    
    private ClassSession createSessionIfNotExists(Sections section, LocalDate date) {
        LocalTime defaultTime = LocalTime.of(9, 0); 
        
        // Reuse a stable existing row, including when historical duplicates exist.
        // No historical sessions or dependent attendance records are deleted.
        return classSessionRepository.findFirstBySectionIdAndSessionDateAndStartTimeOrderByIdAsc(
                section.getId(), date, defaultTime).orElseGet(() -> {
            ClassSession session = ClassSession.builder()
                    .section(section)
                    .sessionDate(date)
                    .startTime(defaultTime)
                    .durationMinutes(90)
                    .createdByTeacher(usersRepository.findById(section.getInstructorId()).orElse(null))
                    .build();
            return classSessionRepository.save(session);
        });
    }

    @Transactional
    public void markAttendance(Long sessionId, List<AttendanceRecordDTO> records, Long instructorId) {

        // Serialize even the first mark, when there is no attendance row to lock.
        ClassSession session = classSessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found"));

        if (!session.getSection().getInstructorId().equals(instructorId)) {
            throw new IllegalStateException("You are not the instructor of this section");
        }

        if (records == null) {
            throw new IllegalStateException("Attendance records are required");
        }
        for (AttendanceRecordDTO record : records) {
            if (record == null || record.getStudentId() == null || record.getStatus() == null) {
                throw new IllegalStateException("Student ID and attendance status are required");
            }

            // Validate enrollment
            if (!enrollmentsRepository.existsByStudentIdAndSectionIdAndStatus(
                    record.getStudentId(),
                    session.getSection().getId(),
                    "ENROLLED")) {
                throw new IllegalStateException("Student is not enrolled in this section");
            }

            AttendanceStatus status;
            try {
                status = AttendanceStatus.valueOf(record.getStatus());
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException("Invalid attendance status");
            }

            List<Attendance> existing = attendanceRepository.findAllBySessionIdAndStudentId(
                    sessionId, record.getStudentId());
            if (existing.isEmpty()) {
                attendanceRepository.save(Attendance.builder()
                        .session(session)
                        .student(usersRepository.getReferenceById(record.getStudentId()))
                        .status(status)
                        .build());
            } else {
                // An explicit instructor correction also resolves legacy conflicts,
                // while retaining all historical row IDs (no destructive cleanup).
                existing.forEach(attendance -> attendance.setStatus(status));
                attendanceRepository.saveAll(existing);
            }
        }
    }


    public List<ClassSession> getSessionsBySection(Long sectionId) {
        return classSessionRepository.findBySectionId(sectionId);
    }
    
    public List<AttendanceDTO> getAttendanceBySession(Long sessionId) {
        return attendanceRepository.findBySessionId(sessionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<AttendanceDTO> getStudentAttendanceForSection(Long studentId, Long sectionId) {
        return attendanceRepository.findByStudentIdAndSession_SectionId(studentId, sectionId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryDTO> getStudentAttendanceSummary(Long studentId) {
        List<AttendanceSummaryDTO> summaries = new ArrayList<>();
        
        enrollmentsRepository.findByStudentIdAndStatus(studentId, "ENROLLED").forEach(enrollment -> {
            Long sectionId = enrollment.getSectionId();
            // Count recorded sessions, not rows left by the old insert-only writer.
            Map<Long, AttendanceStatus> statusBySession = new HashMap<>();
            attendanceRepository.findByStudentIdAndSession_SectionId(studentId, sectionId).forEach(attendance -> {
                AttendanceStatus previous = statusBySession.putIfAbsent(
                        attendance.getSession().getId(), attendance.getStatus());
                if (previous != null && previous != attendance.getStatus()) {
                    throw new IllegalStateException("Conflicting historical attendance for session "
                            + attendance.getSession().getId() + "; instructor must mark attendance again");
                }
            });
            Long totalClasses = (long) statusBySession.size();
            // Preserve LATE as present and LEAVE as absent.
            Long presentCount = statusBySession.values().stream()
                    .filter(status -> status == AttendanceStatus.PRESENT || status == AttendanceStatus.LATE).count();
            Long absentCount = totalClasses - presentCount;

            AttendanceSummaryDTO summary = new AttendanceSummaryDTO();
            summary.setSectionId(sectionId);
            summary.setTotalClasses(totalClasses);
            summary.setPresentCount(presentCount);
            summary.setAbsentCount(absentCount);
            summary.setAttendancePercentage(totalClasses > 0 ? (presentCount * 100.0 / totalClasses) : 0.0);

            sectionsRepository.findById(sectionId).ifPresent(section -> {
                coursesRepository.findById(section.getCourseId()).ifPresent(course -> {
                    summary.setCourseCode(course.getCode());
                    summary.setCourseTitle(course.getTitle());
                });
            });
            summaries.add(summary);
        });
        return summaries;
    }

    private AttendanceDTO toDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setSessionId(attendance.getSession().getId());
        dto.setSectionId(attendance.getSession().getSection().getId());
        dto.setAttendanceDate(attendance.getSession().getSessionDate());
        dto.setStatus(attendance.getStatus().name());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getName()); 

        Sections section = attendance.getSession().getSection();
        coursesRepository.findById(section.getCourseId()).ifPresent(course -> {
             dto.setCourseCode(course.getCode());
             dto.setCourseTitle(course.getTitle());
        });

        return dto;
    }
}
