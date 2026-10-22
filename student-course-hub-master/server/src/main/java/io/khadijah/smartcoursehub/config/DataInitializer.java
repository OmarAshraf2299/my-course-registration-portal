package io.khadijah.smartcoursehub.config;

import io.khadijah.smartcoursehub.entity.Courses;
import io.khadijah.smartcoursehub.entity.Sections;
import io.khadijah.smartcoursehub.entity.Users;
import io.khadijah.smartcoursehub.repository.CoursesRepository;
import io.khadijah.smartcoursehub.repository.SectionsRepository;
import io.khadijah.smartcoursehub.repository.UsersRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private SectionsRepository sectionsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        createAdminUser();
        loadCoursesFromCSV();
    }

    private void createAdminUser() {
        if (usersRepository.findByEmail("admin@smartcoursehub.com").isEmpty()) {
            Users admin = Users.builder()
                    .name("System Administrator")
                    .email("admin@smartcoursehub.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .enabled(true)
                    .build();
            usersRepository.save(admin);
            log.info("Default admin user created: admin@smartcoursehub.com");
        }
    }

    private void loadCoursesFromCSV() {
        if (coursesRepository.count() > 0) {
            log.info("Courses already populated, skipping CSV load.");
            return;
        }

        log.info("Loading courses from CSV resource...");
        try (BufferedReader br = new BufferedReader(new InputStreamReader(
                new ClassPathResource("Courses_Processed.csv").getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean firstLine = true;
            int courseCounter = 100;

            while ((line = br.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (values.length < 5) continue;

                String courseName = values[0].replace("\"", "").trim();
                String creditHoursStr = values[1].replace("\"", "").trim();
                String semester = values[2].replace("\"", "").trim();
                String sectionName = values[3].replace("\"", "").trim();
                String instructorName = values[4].replace("\"", "").trim();

                Users instructor = createOrGetInstructor(instructorName);
                Courses course = createOrGetCourse(courseName, creditHoursStr, ++courseCounter);
                createSection(course, instructor, semester, sectionName);
            }
            log.info("CSV Data loaded successfully.");

        } catch (Exception e) {
            log.error("Error loading CSV data", e);
        }
    }

    private Users createOrGetInstructor(String name) {
        String email = generateEmail(name);
        Optional<Users> existing = usersRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        Users instructor = Users.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("password123"))
                .role("INSTRUCTOR")
                .enabled(true)
                .build();
        return usersRepository.save(instructor);
    }

    private Courses createOrGetCourse(String title, String creditHoursStr, int counter) {
        return coursesRepository.findAll().stream()
                .filter(c -> c.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> {
                    int creditHours = 3;
                    try {
                        creditHours = Integer.parseInt(creditHoursStr);
                    } catch (NumberFormatException e) {
                        // ignore
                    }

                    Courses newCourse = Courses.builder()
                            .code("CSE-" + counter)
                            .title(title)
                            .description(title)
                            .creditHours(creditHours)
                            .build();
                    return coursesRepository.save(newCourse);
                });
    }

    private void createSection(Courses course, Users instructor, String semester, String sectionName) {
        Sections section = Sections.builder()
                .courseId(course.getId())
                .instructorId(instructor.getId())
                .semester(semester)
                .capacity(30)
                .room("TBD")
                .schedule("Section " + sectionName + " - TBD")
                .build();
        
        sectionsRepository.save(section);
    }

    private String generateEmail(String name) {
        String cleanName = name.replaceAll("[^a-zA-Z0-9\\s]", "").trim();
        String[] parts = cleanName.split("\\s+");
        String localPart = parts[0].toLowerCase();
        if (parts.length > 1) {
            localPart += "." + parts[parts.length - 1].toLowerCase();
        }
        return localPart + "@smartcoursehub.com";
    }
}