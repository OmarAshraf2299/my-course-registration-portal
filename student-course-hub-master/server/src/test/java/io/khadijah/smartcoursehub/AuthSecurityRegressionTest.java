package io.khadijah.smartcoursehub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.khadijah.smartcoursehub.config.DataInitializer;
import io.khadijah.smartcoursehub.entity.Users;
import io.khadijah.smartcoursehub.repository.UsersRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthSecurityRegressionTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UsersRepository users;
    @Autowired PasswordEncoder encoder;
    @MockitoBean DataInitializer initializer;

    private String registration(String role) throws Exception {
        return json.writeValueAsString(Map.of("name", "M3 Test Student", "email", "m3-student@example.test",
                "password", "synthetic-test-password", "role", role));
    }

    @ParameterizedTest
    @ValueSource(strings = {"ADMIN", "admin", "AdMiN", "INSTRUCTOR", "instructor", "UNKNOWN", " STUDENT "})
    void publicRegistrationRejectsUnauthorizedRolesWithoutSaving(String role) throws Exception {
        long before = users.count();
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registration(role)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.success").value(false));
        assertThat(users.count()).isEqualTo(before);
    }

    @Test
    void missingRoleIsRejected() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"M3 Student\",\"email\":\"m3-missing@example.test\",\"password\":\"synthetic-test-password\"}"))
                .andExpect(status().isBadRequest());
        assertThat(users.findByEmail("m3-missing@example.test")).isEmpty();
    }

    @Test
    void studentRegistrationLoginAndAdminDenial() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(registration("student")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.role").value("STUDENT"));
        Users student = users.findByEmail("m3-student@example.test").orElseThrow();
        assertThat(student.getRole()).isEqualTo("STUDENT");
        assertThat(encoder.matches("synthetic-test-password", student.getPassword())).isTrue();
        String token = login(student.getEmail(), "synthetic-test-password");
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/student/sections/available").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", student.getEmail(), "password", "incorrect"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void existingAdminCanLoginAndProvisionPrivilegedAccounts() throws Exception {
        users.save(Users.builder().name("M3 Admin").email("m3-admin@example.test")
                .password(encoder.encode("synthetic-test-password")).role("ADMIN").enabled(true).build());
        String token = login("m3-admin@example.test", "synthetic-test-password");
        mvc.perform(get("/api/admin/users").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
        for (String role : new String[]{"ADMIN", "INSTRUCTOR"}) {
            mvc.perform(post("/api/admin/users").header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of(
                                    "name", "M3 Provisioned", "email", "m3-" + role + "@example.test",
                                    "password", "synthetic-test-password", "role", role))))
                    .andExpect(status().isOk());
            assertThat(users.findByEmail("m3-" + role + "@example.test").orElseThrow().getRole()).isEqualTo(role);
            login("m3-" + role + "@example.test", "synthetic-test-password");
        }
    }

    @Test
    void anonymousCannotUseAdminEndpoints() throws Exception {
        mvc.perform(get("/api/admin/users")).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/users").contentType(MediaType.APPLICATION_JSON).content(registration("ADMIN")))
                .andExpect(status().isForbidden());
    }

    private String login(String email, String password) throws Exception {
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        JsonNode data = json.readTree(response).get("data");
        return data.get("token").asText();
    }
}
