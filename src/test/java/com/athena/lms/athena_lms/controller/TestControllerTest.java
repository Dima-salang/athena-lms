package com.athena.lms.athena_lms.controller;

import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        // Create a teacher
        Teacher teacher = new Teacher();
        teacher.setUsername("teacher1");
        teacher.setPassword("password");
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        teacher.setRole("TEACHER");
        userRepository.save(teacher);
    }

    @Test
    @WithMockUser(username = "teacher1", roles = "TEACHER")
    public void testCreateTest_AssignsTeacherAutomatically() throws Exception {
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("Math Test");
        test.setTestDescription("Midterm Exam");
        // Subject and Section will be handled by the service (created if null/dummy)
        // We need to provide dummy objects for the JSON mapping if the frontend sends
        // them
        // But for this test, we can send a minimal object or one with dummy
        // subject/section

        // Let's create dummy subject/section in the test object
        com.athena.lms.athena_lms.model.Subject subject = new com.athena.lms.athena_lms.model.Subject();
        subject.setName("Math");
        test.setSubject(subject);

        com.athena.lms.athena_lms.model.Section section = new com.athena.lms.athena_lms.model.Section();
        section.setName("Section A");
        test.setSection(section);

        mockMvc.perform(post("/api/tests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(test)))
                .andExpect(status().isOk());

        // Verify the test was saved and teacher was assigned
        com.athena.lms.athena_lms.model.tests.Test savedTest = testRepository.findAll().stream()
                .filter(t -> t.getTestName().equals("Math Test"))
                .findFirst()
                .orElse(null);

        assertNotNull(savedTest);
        assertNotNull(savedTest.getTeacher());
        assertEquals("teacher1", savedTest.getTeacher().getUsername());
    }
}
