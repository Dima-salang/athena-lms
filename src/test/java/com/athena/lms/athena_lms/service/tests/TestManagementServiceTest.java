package com.athena.lms.athena_lms.service.tests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.util.ArrayList;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.athena.lms.athena_lms.dto.MultipleChoiceQuestionDto;
import com.athena.lms.athena_lms.dto.QuestionDto;
import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.mapper.QuestionMapper;
import com.athena.lms.athena_lms.mapper.TestMapper;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.repository.QuestionRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
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

    @Mock
    private TestMapper testMapper;

    @Mock
    private QuestionMapper questionMapper;

    @InjectMocks
    private TestManagementService testManagementService;

    private Teacher teacher;
    private Test testEntity;
    private TestDto testDto;

    @BeforeEach
    void setUp() {
        teacher = new Teacher();
        teacher.setId(1L);
        teacher.setUsername("teacher1");

        testEntity = new Test();
        testEntity.setId(1L);
        testEntity.setTestName("Unit Test");
        testEntity.setQuestions(new ArrayList<>());

        testDto = new TestDto();
        testDto.setId(1L);
        testDto.setTestName("Unit Test");
    }

    @org.junit.jupiter.api.Test
    void createTest_Success() {
        when(userRepository.findByUsername("teacher1")).thenReturn(teacher);
        when(testMapper.toEntity(any(TestDto.class))).thenReturn(testEntity);
        when(testRepository.save(any(Test.class))).thenReturn(testEntity);
        when(testMapper.toDto(any(Test.class))).thenReturn(testDto);

        TestDto created = testManagementService.createTest(testDto, "teacher1");

        assertNotNull(created);
        verify(testRepository).save(testEntity);
    }

    @org.junit.jupiter.api.Test
    void createTest_NotTeacher_ThrowsException() {
        Student student = new Student();
        student.setUsername("student1");
        when(testMapper.toEntity(any(TestDto.class))).thenReturn(testEntity);
        when(userRepository.findByUsername("student1")).thenReturn(student);

        assertThrows(RuntimeException.class, () -> {
            testManagementService.createTest(testDto, "student1");
        });
    }

    @org.junit.jupiter.api.Test
    void createTest_WithNewSubjectAndSection() {
        when(userRepository.findByUsername("teacher1")).thenReturn(teacher);
        when(testMapper.toEntity(any(TestDto.class))).thenReturn(testEntity);
        when(testRepository.save(any(Test.class))).thenReturn(testEntity);
        when(testMapper.toDto(any(Test.class))).thenReturn(testDto);

        // Setup DTO with embedded section (fallback logic test)
        // Setup DTO with embedded section (fallback logic test)
        com.athena.lms.athena_lms.dto.SectionDto section = new com.athena.lms.athena_lms.dto.SectionDto();
        section.setName("New Section");
        testDto.setSection(section);

        // In the new implementation, we check testDto.getSectionId() first.
        // If null, we check testDto.getTestSection().

        when(sectionRepository.findByName("New Section")).thenReturn(null);
        when(sectionRepository.save(any(Section.class))).thenAnswer(i -> i.getArguments()[0]);

        TestDto created = testManagementService.createTest(testDto, "teacher1");

        verify(sectionRepository).save(any(Section.class));
    }

    @org.junit.jupiter.api.Test
    void createQuestion_Success() {
        when(testRepository.findById(1L)).thenReturn(Optional.of(testEntity));

        MultipleChoiceQuestion qEntity = new MultipleChoiceQuestion();
        qEntity.setQuestionText("Q1");

        MultipleChoiceQuestionDto qDto = new MultipleChoiceQuestionDto();
        qDto.setQuestionText("Q1");

        when(questionMapper.toEntity(any(QuestionDto.class))).thenReturn(qEntity);
        when(questionRepository.saveAll(anyList())).thenReturn(List.of(qEntity));
        when(questionMapper.toDto(any(Question.class))).thenReturn(qDto);

        List<QuestionDto> questions = new ArrayList<>();
        questions.add(qDto);

        List<QuestionDto> created = testManagementService.createQuestions(questions, 1L);

        assertNotNull(created);
        assertEquals(1, created.size());
        verify(questionRepository).saveAll(anyList());
    }

    @org.junit.jupiter.api.Test
    void createQuestion_TestNotFound_ThrowsException() {
        when(testRepository.findById(99L)).thenReturn(Optional.empty());

        List<QuestionDto> questions = new ArrayList<>();
        questions.add(new MultipleChoiceQuestionDto());

        assertThrows(RuntimeException.class, () -> {
            testManagementService.createQuestions(questions, 99L);
        });
    }
}
