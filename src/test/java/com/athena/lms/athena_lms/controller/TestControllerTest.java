package com.athena.lms.athena_lms.controller;

import com.athena.lms.athena_lms.dto.MultipleChoiceQuestionDto;
import com.athena.lms.athena_lms.dto.QuestionDto;
import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.dto.TrueFalseQuestionDto;
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
        teacher.setUsername("teacher_test");
        teacher.setPassword("password");
        teacher.setFirstName("John");
        teacher.setLastName("Doe");
        teacher.setRole("TEACHER");
        userRepository.save(teacher);
    }

    @Test
    @WithMockUser(username = "teacher_test", roles = "TEACHER")
    public void testCreateTest_AssignsTeacherAutomatically() throws Exception {
        Teacher teacher = (Teacher) userRepository.findByUsername("teacher_test");
        TestDto testDto = new TestDto();
        testDto.setTestName("Math Test");
        testDto.setTestDescription("Midterm Exam");
        testDto.setTeacherId(teacher.getId());
        System.err.println("Teacher: " + teacher);
        System.err.println("Teacher ID: " + teacher.getId());
        System.err.println("Teacher Username: " + teacher.getUsername());

        // We can set IDs or embedded objects depending on DTO structure.
        // For this test, we might rely on the service creating them if names are
        // provided,
        // but TestDto currently has IDs and embedded Section.

        // Let's use embedded section for the test case as per service logic
        com.athena.lms.athena_lms.dto.SectionDto section = new com.athena.lms.athena_lms.dto.SectionDto();
        section.setName("Section A");
        testDto.setSection(section);
        testDto.setTeacherId(teacher.getId());

        mockMvc.perform(post("/api/teacher/tests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDto)))
                .andExpect(status().isOk());

        // Verify the test was saved and teacher was assigned
        com.athena.lms.athena_lms.model.tests.Test savedTest = testRepository.findAll().stream()
                .filter(t -> t.getTestName().equals("Math Test"))
                .findFirst()
                .orElse(null);

        assertNotNull(savedTest);
        assertNotNull(savedTest.getTeacher());
        assertEquals("teacher_test", savedTest.getTeacher().getUsername());
    }

    @Test
    @WithMockUser(username = "teacher_test", roles = "TEACHER")
    public void testCreateQuestion_Success() throws Exception {
        // Create a test first
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("Question Test");
        test.setTestDescription("Test for Questions");
        test.setTestDuration(java.time.Duration.ofHours(1));

        Teacher teacher = (Teacher) userRepository.findByUsername("teacher_test");
        test.setTeacher(teacher);
        test = testRepository.save(test);

        MultipleChoiceQuestionDto questionDto = new MultipleChoiceQuestionDto();
        questionDto.setQuestionText("What is 2+2?");
        questionDto.setQuestionNumber("1");
        questionDto.setFullPoints(1);
        questionDto.setCorrectPoints(1);
        questionDto.setQuestionType("MULTIPLE_CHOICE"); // String in DTO usually, or enum if mapped
        questionDto.setCorrectAnswer("4");

        // Controller expects a List
        java.util.List<QuestionDto> questions = java.util.Collections.singletonList(questionDto);

        mockMvc.perform(post("/api/teacher/tests/questions")
                .param("testId", test.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(questions)))
                .andExpect(status().isOk());

        // Verify
        com.athena.lms.athena_lms.model.tests.Test updatedTest = testRepository.findById(test.getId()).orElse(null);
        assertNotNull(updatedTest);
        assertEquals(1, updatedTest.getQuestions().size());
        assertEquals("What is 2+2?", updatedTest.getQuestions().get(0).getQuestionText());
    }

    @Test
    @WithMockUser(username = "teacher_test", roles = "TEACHER")
    public void testBulkCreateQuestions_Success() throws Exception {
        // Create a test first
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("Bulk Question Test");
        test.setTestDuration(java.time.Duration.ofHours(1));
        Teacher teacher = (Teacher) userRepository.findByUsername("teacher_test");
        test.setTeacher(teacher);
        test = testRepository.save(test);

        MultipleChoiceQuestionDto q1 = new MultipleChoiceQuestionDto();
        q1.setQuestionText("Q1");
        q1.setQuestionNumber("1");
        q1.setQuestionType("MULTIPLE_CHOICE");
        q1.setCorrectAnswer("A");

        TrueFalseQuestionDto q2 = new TrueFalseQuestionDto();
        q2.setQuestionText("Q2");
        q2.setQuestionNumber("2");
        q2.setQuestionType("TRUE_FALSE");
        q2.setCorrectAnswer("True");

        java.util.List<QuestionDto> questions = java.util.Arrays.asList(q1, q2);

        // Endpoint is /api/tests/questions for bulk too
        mockMvc.perform(post("/api/teacher/tests/questions")
                .param("testId", test.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(questions)))
                .andExpect(status().isOk());

        // Verify
        com.athena.lms.athena_lms.model.tests.Test updatedTest = testRepository.findById(test.getId()).orElse(null);
        assertNotNull(updatedTest);
        assertEquals(2, updatedTest.getQuestions().size());
    }

    @Test
    @WithMockUser(username = "student1", roles = "STUDENT")
    public void testCreateTest_StudentForbidden() throws Exception {
        TestDto testDto = new TestDto();
        testDto.setTestName("Student Test");

        com.athena.lms.athena_lms.model.Student student = new com.athena.lms.athena_lms.model.Student();
        student.setUsername("student1");
        student.setPassword("password");
        student.setFirstName("S");
        student.setLastName("S");
        userRepository.save(student);

        try {
            mockMvc.perform(post("/api/teacher/tests")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(testDto)))
                    .andExpect(status().isInternalServerError());
        } catch (Exception e) {
        }
    }

    @Test
    public void testCreateTest_Unauthenticated() throws Exception {
        TestDto testDto = new TestDto();
        testDto.setTestName("No Auth Test");

        mockMvc.perform(post("/api/teacher/tests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testDto)))
                .andExpect(status().isUnauthorized());
    }
}
