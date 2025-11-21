package com.athena.lms.athena_lms.service.tests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.repository.QuestionRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class TestManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TestRepository testRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private SectionRepository sectionRepository;

    @InjectMocks
    private TestManagementService testManagementService;

    private Teacher teacher;
    private Test testEntity;

    @BeforeEach
    void setUp() {
        teacher = new Teacher();
        teacher.setId(1L);
        teacher.setUsername("teacher1");

        testEntity = new Test();
        testEntity.setId(1L);
        testEntity.setTestName("Unit Test");
        testEntity.setQuestions(new ArrayList<>());
    }

    @org.junit.jupiter.api.Test
    void createTest_Success() {
        when(userRepository.findByUsername("teacher1")).thenReturn(teacher);
        when(testRepository.save(any(Test.class))).thenAnswer(i -> i.getArguments()[0]);

        Test created = testManagementService.createTest(testEntity, "teacher1");

        assertNotNull(created);
        assertEquals(teacher, created.getTeacher());
        verify(testRepository).save(testEntity);
    }

    @org.junit.jupiter.api.Test
    void createTest_NotTeacher_ThrowsException() {
        Student student = new Student();
        student.setUsername("student1");
        when(userRepository.findByUsername("student1")).thenReturn(student);

        assertThrows(RuntimeException.class, () -> {
            testManagementService.createTest(testEntity, "student1");
        });
    }

    @org.junit.jupiter.api.Test
    void createTest_WithNewSubjectAndSection() {
        when(userRepository.findByUsername("teacher1")).thenReturn(teacher);
        when(testRepository.save(any(Test.class))).thenAnswer(i -> i.getArguments()[0]);

        Subject subject = new Subject();
        subject.setName("New Subject");
        testEntity.setSubject(subject);

        Section section = new Section();
        section.setName("New Section");
        testEntity.setSection(section);

        when(subjectRepository.findByName("New Subject")).thenReturn(null);
        when(subjectRepository.save(any(Subject.class))).thenAnswer(i -> i.getArguments()[0]);

        when(sectionRepository.findByName("New Section")).thenReturn(null);
        when(sectionRepository.save(any(Section.class))).thenAnswer(i -> i.getArguments()[0]);

        Test created = testManagementService.createTest(testEntity, "teacher1");

        assertNotNull(created.getSubject());
        assertNotNull(created.getSection());
        verify(subjectRepository).save(any(Subject.class));
        verify(sectionRepository).save(any(Section.class));
    }

    @org.junit.jupiter.api.Test
    void createQuestion_Success() {
        when(testRepository.findById(1L)).thenReturn(Optional.of(testEntity));
        when(testRepository.save(any(Test.class))).thenReturn(testEntity);
        // questionRepository.save is called inside
        when(questionRepository.save(any(Question.class))).thenAnswer(i -> i.getArguments()[0]);


        List<Question> questions = new ArrayList<>();
        MultipleChoiceQuestion q = new MultipleChoiceQuestion();
        q.setQuestionText("Q1");
        List<Option> options = new ArrayList<>();
        Option option1 = new Option();
        option1.setOptionText("A");
        Option option2 = new Option();
        option2.setOptionText("B");
        options.add(option1);
        options.add(option2);
        questions.add(q);

        List<Question> created = testManagementService.createQuestions(questions, 1L, options);

        assertNotNull(created);
        assertEquals(testEntity, created.get(0).getTest());
        assertTrue(testEntity.getQuestions().contains(created.get(0)));
        verify(testRepository).save(testEntity);
    }

    @org.junit.jupiter.api.Test
    void createQuestion_TestNotFound_ThrowsException() {
        when(testRepository.findById(99L)).thenReturn(Optional.empty());

        MultipleChoiceQuestion q = new MultipleChoiceQuestion();
        List<Question> questions = new ArrayList<>();
        questions.add(q);
        List<Option> options = new ArrayList<>();

        assertThrows(RuntimeException.class, () -> {
            testManagementService.createQuestions(questions, 99L, options);
        });
    }

    @org.junit.jupiter.api.Test
    void bulkCreateQuestions_Success() {
        when(testRepository.findById(1L)).thenReturn(Optional.of(testEntity));
        when(testRepository.save(any(Test.class))).thenReturn(testEntity);

        MultipleChoiceQuestion q1 = new MultipleChoiceQuestion();
        MultipleChoiceQuestion q2 = new MultipleChoiceQuestion();
        List<Question> questions = Arrays.asList(q1, q2);
        List<Option> options = new ArrayList<>();
        Option option1 = new Option();
        Option option2 = new Option();
        options.add(option1);
        options.add(option2);

        List<Question> created = testManagementService.createQuestions(questions, 1L, options);

        assertEquals(2, created.size());
        assertEquals(testEntity, q1.getTest());
        assertEquals(testEntity, q2.getTest());
        assertEquals(2, testEntity.getQuestions().size());
        verify(testRepository).save(testEntity);
    }
}
