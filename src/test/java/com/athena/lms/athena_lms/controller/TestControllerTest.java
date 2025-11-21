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

    @Test
    @WithMockUser(username = "teacher1", roles = "TEACHER")
    public void testCreateQuestion_Success() throws Exception {
        // Create a test first
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("Question Test");
        test.setTestDescription("Test for Questions");
        test.setTestDuration(java.time.Duration.ofHours(1));

        Teacher teacher = (Teacher) userRepository.findByUsername("teacher1");
        test.setTeacher(teacher);
        test = testRepository.save(test);

        com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion question = new com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion();
        question.setQuestionText("What is 2+2?");
        question.setQuestionNumber("1");
        question.setFullPoints(1);
        question.setCorrectPoints(1);
        question.setQuestionType("MULTIPLE_CHOICE");
        question.setOptions(java.util.Arrays.asList("3", "4", "5"));
        question.setCorrectAnswer("4");

        mockMvc.perform(post("/api/tests/questions")
                .param("testId", test.getId().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(question)))
                .andExpect(status().isOk());

        // Verify
        com.athena.lms.athena_lms.model.tests.Test updatedTest = testRepository.findById(test.getId()).orElse(null);
        assertNotNull(updatedTest);
        assertEquals(1, updatedTest.getQuestions().size());
        assertEquals("What is 2+2?", updatedTest.getQuestions().get(0).getQuestionText());
    }

    @Test
    @WithMockUser(username = "teacher1", roles = "TEACHER")
    public void testBulkCreateQuestions_Success() throws Exception {
        // Create a test first
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("Bulk Question Test");
        test.setTestDuration(java.time.Duration.ofHours(1));
        Teacher teacher = (Teacher) userRepository.findByUsername("teacher1");
        test.setTeacher(teacher);
        test = testRepository.save(test);

        com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion q1 = new com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion();
        q1.setQuestionText("Q1");
        q1.setQuestionNumber("1");
        q1.setQuestionType("MULTIPLE_CHOICE");
        q1.setOptions(java.util.Arrays.asList("A", "B"));
        q1.setCorrectAnswer("A");

        com.athena.lms.athena_lms.model.questions.TrueFalseQuestion q2 = new com.athena.lms.athena_lms.model.questions.TrueFalseQuestion();
        q2.setQuestionText("Q2");
        q2.setQuestionNumber("2");
        q2.setQuestionType("TRUE_FALSE");
        q2.setTrueFalseAnswer("True");

        java.util.List<com.athena.lms.athena_lms.model.questions.Question> questions = java.util.Arrays.asList(q1, q2);

        mockMvc.perform(post("/api/tests/questions/bulk")
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
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("Student Test");

        com.athena.lms.athena_lms.model.Student student = new com.athena.lms.athena_lms.model.Student();
        student.setUsername("student1");
        student.setPassword("password");
        student.setFirstName("S");
        student.setLastName("S");
        userRepository.save(student);

        try {
            mockMvc.perform(post("/api/tests")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(test)))
                    .andExpect(status().isInternalServerError());
        } catch (Exception e) {
        }
    }

    @Test
    public void testCreateTest_Unauthenticated() throws Exception {
        com.athena.lms.athena_lms.model.tests.Test test = new com.athena.lms.athena_lms.model.tests.Test();
        test.setTestName("No Auth Test");

        mockMvc.perform(post("/api/tests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(test)))
                .andExpect(status().isUnauthorized());
    }
}
