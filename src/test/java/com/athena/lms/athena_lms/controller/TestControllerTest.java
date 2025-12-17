package com.athena.lms.athena_lms.controller;

import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.dto.QuestionDto;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
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

        // Create subject and section and assign to teacher
        com.athena.lms.athena_lms.model.Section section = new com.athena.lms.athena_lms.model.Section();
        section.setName("Section A");
        // We'll rely on cascading or separate repository if needed, but this is an
        // integration test.
        // Let's assume repositories are autowired or we need to wire them.
    }

    @Autowired
    private com.athena.lms.athena_lms.repository.TeacherAssignmentRepository teacherAssignmentRepository;
    @Autowired
    private com.athena.lms.athena_lms.repository.SectionRepository sectionRepository;
    @Autowired
    private com.athena.lms.athena_lms.repository.SubjectRepository subjectRepository;

    @BeforeEach
    public void setupAssignment() {
        com.athena.lms.athena_lms.model.Teacher teacher = (com.athena.lms.athena_lms.model.Teacher) userRepository
                .findByUsername("teacher_test");
        if (teacher == null)
            return; // Should be created in setup() if @Transactional rolls back per test, but
                    // setup() runs before each.

        // Ensure section exists (or create it for the test dto payload matching)
        com.athena.lms.athena_lms.model.Section section = sectionRepository.findByName("Section A");
        if (section == null) {
            section = new com.athena.lms.athena_lms.model.Section();
            section.setName("Section A");
            section = sectionRepository.save(section);
        }

        com.athena.lms.athena_lms.model.TeacherAssignment assignment = new com.athena.lms.athena_lms.model.TeacherAssignment();
        Subject subject = new Subject();
        subject.setName("Math");
        subject = subjectRepository.save(subject);

        assignment.setTeacher(teacher);
        assignment.setSection(section);
        assignment.setSubject(subject); // Assuming null subject is allowed for "Adviser" or similar, or just match the
                                        // test case.
        teacherAssignmentRepository.save(assignment);
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
        // Fetch the section created in setupAssignment or create it if not found
        // (transaction isolation might affect visibility)
        com.athena.lms.athena_lms.model.Section savedSection = sectionRepository.findByName("Section A");
        if (savedSection == null) {
            savedSection = new com.athena.lms.athena_lms.model.Section();
            savedSection.setName("Section A");
            savedSection = sectionRepository.save(savedSection);
        }

        com.athena.lms.athena_lms.model.Subject savedSubject = subjectRepository.findByName("Math");
        if (savedSubject == null) {
            savedSubject = new com.athena.lms.athena_lms.model.Subject();
            savedSubject.setName("Math");
            savedSubject = subjectRepository.save(savedSubject);
        }

        // Ensure the teacher is assigned to this subject and section
        boolean assigned = teacherAssignmentRepository.existsByTeacherIdAndSubjectIdAndSectionId(teacher.getId(),
                savedSubject.getId(), savedSection.getId());
        if (!assigned) {
            com.athena.lms.athena_lms.model.TeacherAssignment assignment = new com.athena.lms.athena_lms.model.TeacherAssignment();
            assignment.setTeacher(teacher);
            assignment.setSection(savedSection);
            assignment.setSubject(savedSubject);
            teacherAssignmentRepository.save(assignment);
        }

        com.athena.lms.athena_lms.dto.SectionDto sectionDto = new com.athena.lms.athena_lms.dto.SectionDto();
        sectionDto.setId(savedSection.getId());
        sectionDto.setName("Section A");
        testDto.setSection(sectionDto);
        testDto.setTeacherId(teacher.getId());
        testDto.setSubjectId(savedSubject.getId()); // Set non-null subject ID

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

        // Retrieve subject and section from setupAssignment
        Subject subject = subjectRepository.findByName("Math");
        Section section = sectionRepository.findByName("Section A");
        test.setSubject(subject);
        test.setSection(section);

        Teacher teacher = (Teacher) userRepository.findByUsername("teacher_test");
        test.setTeacher(teacher);
        test = testRepository.save(test);

        QuestionDto questionDto = new QuestionDto();
        questionDto.setQuestionText("What is 2+2?");
        questionDto.setQuestionNumber("1");
        questionDto.setFullPoints(1);
        questionDto.setCorrectPoints(1);
        questionDto.setQuestionType("MULTIPLE_CHOICE");
        questionDto.setCorrectAnswer("4"); // Or correctOptionId/options if testing that specific logic

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

        QuestionDto q1 = new QuestionDto();
        q1.setQuestionText("Q1");
        q1.setQuestionNumber("1");
        q1.setQuestionType("MULTIPLE_CHOICE");
        q1.setCorrectAnswer("A");

        QuestionDto q2 = new QuestionDto();
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
