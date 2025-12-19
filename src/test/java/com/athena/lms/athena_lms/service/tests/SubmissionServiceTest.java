package com.athena.lms.athena_lms.service.tests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.athena.exceptions.AccessDeniedException;
import com.athena.exceptions.NotFoundException;
import com.athena.lms.athena_lms.dto.StudentAnswerDto;
import com.athena.lms.athena_lms.dto.SubmissionDto;
import com.athena.lms.athena_lms.mapper.StudentAnswerMapper;
import com.athena.lms.athena_lms.mapper.SubmissionMapper;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.questions.*;
import com.athena.lms.athena_lms.model.submission.StudentAnswer;
import com.athena.lms.athena_lms.model.submission.Submission;
import com.athena.lms.athena_lms.repository.OptionRepository;
import com.athena.lms.athena_lms.repository.StudentAnswerRepository;
import com.athena.lms.athena_lms.repository.SubmissionRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;
import jakarta.persistence.EntityManager;
import com.blazebit.persistence.CriteriaBuilder;
import com.blazebit.persistence.CriteriaBuilderFactory;

@ExtendWith(MockitoExtension.class)
public class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private StudentAnswerRepository studentAnswerRepository;

    @Mock
    private SubmissionMapper submissionMapper;

    @Mock
    private StudentAnswerMapper studentAnswerMapper;

    @Mock
    private TestRepository testRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OptionRepository optionRepository;

    @Mock
    private com.athena.lms.athena_lms.repository.QuestionRepository questionRepository;

    @Mock
    private CriteriaBuilderFactory cbf;

    @Mock
    private EntityManager em;

    @Mock
    private CriteriaBuilder<Submission> cb;

    @InjectMocks
    private SubmissionService submissionService;

    private Submission submission;
    private SubmissionDto submissionDto;
    private StudentAnswer studentAnswer;
    private StudentAnswerDto studentAnswerDto;
    private com.athena.lms.athena_lms.model.tests.Test testEntity;
    private Student student;

    @BeforeEach
    void setUp() {
        testEntity = new com.athena.lms.athena_lms.model.tests.Test();
        testEntity.setId(100L);
        testEntity.setTestDuration(java.time.Duration.ofMinutes(60));
        testEntity.setTestDueDate(Instant.now().plus(1, ChronoUnit.DAYS));
        testRepository.save(testEntity);

        student = new Student();
        student.setId(1L);
        student.setUsername("student1");

        submission = new Submission();
        submission.setId(1L);
        submission.setTest(testEntity);
        submission.setStudent(student);

        submissionDto = new SubmissionDto();
        submissionDto.setId(1L);

        studentAnswer = new StudentAnswer();
        studentAnswer.setId(1L);

        studentAnswerDto = new StudentAnswerDto();
        studentAnswerDto.setId(1L);
        studentAnswerDto.setOptionId(10L);
        com.athena.lms.athena_lms.dto.QuestionDto qDto = new com.athena.lms.athena_lms.dto.QuestionDto();
        qDto.setId(100L);
        studentAnswerDto.setQuestion(qDto);
    }

    @Test
    void createOrUpdateSubmission_NewSubmission_Success() {
        SubmissionDto newDto = new SubmissionDto();
        // ID is null for new submission

        Submission newEntity = new Submission();

        when(submissionRepository.findById(any())).thenReturn(Optional.empty());
        when(submissionMapper.toEntity(any(SubmissionDto.class))).thenReturn(newEntity);
        when(submissionRepository.save(any(Submission.class))).thenReturn(newEntity);
        when(submissionMapper.toDto(any(Submission.class))).thenReturn(newDto);

        SubmissionDto result = submissionService.createOrUpdateSubmission(newDto);

        assertNotNull(result);
        verify(submissionRepository).save(newEntity);
        verify(submissionMapper).toEntity(newDto);
    }

    @Test
    void createOrUpdateSubmission_ExistingSubmission_Success() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));
        when(submissionRepository.save(any(Submission.class))).thenReturn(submission);
        when(submissionMapper.toDto(any(Submission.class))).thenReturn(submissionDto);

        SubmissionDto result = submissionService.createOrUpdateSubmission(submissionDto);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(submissionRepository).save(submission);
        verify(submissionMapper, never()).toEntity(any(SubmissionDto.class));
    }

    @Test
    void deleteSubmission_Success() {
        doNothing().when(submissionRepository).deleteById(1L);

        submissionService.deleteSubmission(1L);

        verify(submissionRepository).deleteById(1L);
    }

    @Mock
    private com.blazebit.persistence.RestrictionBuilder<CriteriaBuilder<Submission>> restrictionBuilder;

    @Test
    void getSubmissionsByTest_Success() {
        List<Submission> submissions = new ArrayList<>();
        submissions.add(submission);

        when(testRepository.existsById(100L)).thenReturn(true);
        when(cbf.create(em, Submission.class)).thenReturn(cb);
        when(cb.where(anyString())).thenReturn(restrictionBuilder);
        when(restrictionBuilder.eq(anyLong())).thenReturn(cb);
        when(cb.where(anyString())).thenReturn(restrictionBuilder);
        when(restrictionBuilder.isNotNull()).thenReturn(cb);
        when(cb.orderByDesc(anyString())).thenReturn(cb);
        when(cb.getResultList()).thenReturn(submissions);
        when(submissionMapper.toDto(any(Submission.class))).thenReturn(submissionDto);

        List<SubmissionDto> results = submissionService.getSubmissionsByTest(100L, "");

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(1L, results.getFirst().getId());
    }

    @Test
    void getSubmissionsByTest_NoSubmissions_ReturnsEmptyList() {
        when(testRepository.existsById(100L)).thenReturn(true);
        when(cbf.create(em, Submission.class)).thenReturn(cb);
        when(cb.where(anyString())).thenReturn(restrictionBuilder);
        when(restrictionBuilder.eq(anyLong())).thenReturn(cb);
        when(cb.where(anyString())).thenReturn(restrictionBuilder);
        when(restrictionBuilder.isNotNull()).thenReturn(cb);
        when(cb.orderByDesc(anyString())).thenReturn(cb);
        when(cb.getResultList()).thenReturn(new ArrayList<>());

        List<SubmissionDto> results = submissionService.getSubmissionsByTest(100L, "");

        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(submissionMapper, never()).toDto(any(Submission.class));
    }

    @Test
    void getSubmissionsByTest_TestNotFound_ThrowsNotFoundException() {
        when(testRepository.existsById(100L)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> submissionService.getSubmissionsByTest(100L, ""));
    }

    // student answers tests

    @Test
    void createOrUpdateStudentAnswers_NewAnswers_Success() {
        StudentAnswerDto newAnswerDto = new StudentAnswerDto();
        newAnswerDto.setOptionId(10L);
        List<StudentAnswerDto> dtos = List.of(newAnswerDto);

        StudentAnswer newEntity = new StudentAnswer();
        Option option = new Option();
        option.setId(10L);

        when(optionRepository.findById(10L)).thenReturn(Optional.of(option));
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(newEntity));
        when(studentAnswerMapper.toDtoList(anyList())).thenReturn(dtos);

        List<StudentAnswerDto> results = submissionService.createOrUpdateStudentAnswers(dtos);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(optionRepository).findById(10L); // Verify option was looked up
        verify(studentAnswerRepository).saveAll(anyList());
    }

    @Test
    void createOrUpdateStudentAnswers_ExistingAnswers_Success() {
        List<StudentAnswerDto> dtos = List.of(studentAnswerDto);
        Option option = new Option();
        option.setId(10L);

        when(studentAnswerRepository.findById(1L)).thenReturn(Optional.of(studentAnswer));

        when(optionRepository.findById(10L)).thenReturn(Optional.of(option));
        // Fix: mock questionRepository as well since DTO has question ID
        when(questionRepository.findById(100L)).thenReturn(Optional.of(new Question()));

        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerMapper.toDtoList(anyList())).thenReturn(dtos);

        List<StudentAnswerDto> results = submissionService.createOrUpdateStudentAnswers(dtos);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(studentAnswerRepository).findById(1L);
        verify(optionRepository).findById(10L);
        verify(studentAnswerRepository).saveAll(anyList());
    }

    @Test
    void createOrUpdateStudentAnswers_MixedNewAndExisting_Success() {
        StudentAnswerDto newDto = new StudentAnswerDto(); // ID null
        newDto.setOptionId(11L);
        StudentAnswerDto existingDto = new StudentAnswerDto();
        existingDto.setId(1L);
        existingDto.setOptionId(10L);

        List<StudentAnswerDto> dtos = List.of(newDto, existingDto);

        StudentAnswer newEntity = new StudentAnswer();
        StudentAnswer existingEntity = new StudentAnswer();
        existingEntity.setId(1L);

        Option option1 = new Option();
        option1.setId(11L);
        Option option2 = new Option();
        option2.setId(10L);

        // Mock for new answer

        when(optionRepository.findById(11L)).thenReturn(Optional.of(option1));

        // Mock for existing answer
        when(studentAnswerRepository.findById(1L)).thenReturn(Optional.of(existingEntity));

        when(optionRepository.findById(10L)).thenReturn(Optional.of(option2));

        // Mock saveAll
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(newEntity, existingEntity));
        when(studentAnswerMapper.toDtoList(anyList())).thenReturn(dtos);

        List<StudentAnswerDto> results = submissionService.createOrUpdateStudentAnswers(dtos);

        assertNotNull(results);
        assertEquals(2, results.size());
        // verify(studentAnswerMapper).toEntity(newDto);
        verify(studentAnswerRepository).findById(1L);
        // verify(studentAnswerMapper).updateEntityFromDto(existingDto, existingEntity);
        verify(studentAnswerRepository).saveAll(anyList());
    }

    // startTest tests

    @Test
    void startTest_Success_NewSubmission() {
        when(userRepository.findByUsername("student1")).thenReturn(student);
        when(testRepository.findById(100L)).thenReturn(Optional.of(testEntity));
        // Fix: use submittedAt instead of endTime
        when(submissionRepository.findFirstByTestIdAndStudentIdAndSubmittedAtIsNull(100L, 1L)).thenReturn(null);

        Submission savedSubmission = new Submission();
        savedSubmission.setId(500L);

        when(submissionRepository.save(any(Submission.class))).thenReturn(savedSubmission);
        when(submissionMapper.toDto(savedSubmission)).thenReturn(submissionDto);

        SubmissionDto result = submissionService.startTest(100L, "student1");

        assertNotNull(result);
        verify(submissionRepository).save(any(Submission.class));
    }

    @Test
    void startTest_Success_ResumingExisting() {
        when(userRepository.findByUsername("student1")).thenReturn(student);
        when(testRepository.findById(100L)).thenReturn(Optional.of(testEntity));
        // Fix: use submittedAt instead of endTime
        when(submissionRepository.findFirstByTestIdAndStudentIdAndSubmittedAtIsNull(100L, 1L)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        SubmissionDto result = submissionService.startTest(100L, "student1");

        assertNotNull(result);
        // Verify we simply returned the existing one and didn't create new
        verify(submissionRepository, never()).save(any(Submission.class));
    }

    @Test
    void startTest_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(null);

        assertThrows(AccessDeniedException.class, () -> {
            submissionService.startTest(100L, "unknown");
        });
    }

    @Test
    void startTest_UserNotStudent() {
        User teacher = new User(); // Not instance of Student, just generic User or other subclass if exists
        teacher.setUsername("teacher");
        when(userRepository.findByUsername("teacher")).thenReturn(teacher);

        assertThrows(AccessDeniedException.class, () -> {
            submissionService.startTest(100L, "teacher");
        });
    }

    @Test
    void startTest_TestNotFound() {
        when(userRepository.findByUsername("student1")).thenReturn(student);
        when(testRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> {
            submissionService.startTest(999L, "student1");
        });
    }

    // getStudentAnswers tests

    @Test
    void getStudentAnswers_Success() {
        List<StudentAnswer> answers = List.of(studentAnswer);
        List<StudentAnswerDto> dtos = List.of(studentAnswerDto);

        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(answers);
        when(studentAnswerMapper.toDtoList(answers)).thenReturn(dtos);

        List<StudentAnswerDto> result = submissionService.getStudentAnswers(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(studentAnswerRepository).findBySubmissionId(1L);
    }

    // submitTest tests

    @Test
    void submitTest_Success() {
        // Test due date is future (set in setUp)
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        // Create a multiple choice question with correct answer ID 10
        Question mcqQuestion = new Question();
        mcqQuestion.setId(100L);
        mcqQuestion.setFullPoints(10.0);
        mcqQuestion.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        mcqQuestion.setCorrectOptionId(10L);

        // Create student answer
        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setQuestion(mcqQuestion);

        Option option = new Option();
        option.setId(10L); // Correct option
        studentAnswer.setOption(option);

        List<StudentAnswerDto> answersToSubmit = List.of(studentAnswerDto);

        when(optionRepository.findById(10L)).thenReturn(Optional.of(option));
        when(questionRepository.findById(100L)).thenReturn(Optional.of(mcqQuestion));
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));

        // Mock for calculateScore
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(studentAnswer));

        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertNotNull(submission.getSubmittedAt()); // Verify timestamp set
        assertEquals(10.0, submission.getTotalScore()); // Verify score calculated
        assertEquals(10.0, studentAnswer.getPoints()); // Verify answer points set
        verify(submissionRepository).save(submission); // Save once at the end
        verify(studentAnswerRepository).saveAll(anyList());
        verify(studentAnswerRepository).findBySubmissionId(1L); // Verify calculateScore was called
    }

    @Test
    void submitTest_SubmissionNotFound() {
        when(submissionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            submissionService.submitTest(999L, List.of());
        });
    }

    @Test
    void submitTest_TestEnded() {
        // Set test due date to past
        testEntity.setTestDueDate(Instant.now().minus(1, ChronoUnit.DAYS));

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        assertThrows(RuntimeException.class, () -> {
            submissionService.submitTest(1L, List.of(studentAnswerDto));
        });

        assertEquals("Test has already ended",
                assertThrows(RuntimeException.class, () -> submissionService.submitTest(1L, List.of(studentAnswerDto)))
                        .getMessage());
    }

    @Test
    void submitTest_OptionNotFound() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        List<StudentAnswerDto> answers = List.of(studentAnswerDto); // has optionId 10

        when(questionRepository.findById(100L)).thenReturn(Optional.of(new Question()));
        when(optionRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            submissionService.submitTest(1L, answers);
        });
    }

    @Test
    void getSubmissionById_Success() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        SubmissionDto result = submissionService.getSubmissionById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());

        verify(submissionRepository).findById(1L);
    }

    @Test
    void getSubmissionById_NotFound() {
        when(submissionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> submissionService.getSubmissionById(999L));
    }

    @Test
    void submitTest_MultipleChoiceWrongAnswer() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        // Create a multiple choice question with correct answer ID 10
        Question mcqQuestion = new Question();
        mcqQuestion.setId(100L);
        mcqQuestion.setFullPoints(10.0);
        mcqQuestion.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        mcqQuestion.setCorrectOptionId(10L);

        // Student selects wrong option (ID 11)
        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setQuestion(mcqQuestion);

        Option wrongOption = new Option();
        wrongOption.setId(11L); // Wrong option
        studentAnswer.setOption(wrongOption);

        List<StudentAnswerDto> answersToSubmit = List.of(studentAnswerDto);

        when(optionRepository.findById(10L)).thenReturn(Optional.of(wrongOption));
        when(questionRepository.findById(100L)).thenReturn(Optional.of(mcqQuestion));
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(studentAnswer));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertEquals(0.0, submission.getTotalScore()); // Wrong answer = 0 points
        assertEquals(0.0, studentAnswer.getPoints()); // Points not set for wrong answer
    }

    @Test
    void submitTest_IdentificationCorrectAnswer() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        // Create identification question
        Question idQuestion = new Question();
        idQuestion.setId(101L);
        idQuestion.setFullPoints(15.0);
        idQuestion.setQuestionType(QuestionType.IDENTIFICATION);
        idQuestion.setCorrectAnswer("Paris");

        // Student provides correct answer
        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setQuestion(idQuestion);
        studentAnswer.setTextAnswer("Paris");

        List<StudentAnswerDto> answersToSubmit = List.of(studentAnswerDto);

        // Mock question lookup (using ID 100 for DTO even though question has 101L,
        // need to match setup or modify DTO)
        // DTO in setup has question ID 100.
        when(questionRepository.findById(100L)).thenReturn(Optional.of(idQuestion)); // Use 100L to match DTO

        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(studentAnswer));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        studentAnswerDto.setOptionId(null); // No option for identification
        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertEquals(15.0, submission.getTotalScore());
        assertEquals(15.0, studentAnswer.getPoints());
    }

    @Test
    void submitTest_IdentificationWrongAnswer() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        Question idQuestion = new Question();
        idQuestion.setId(101L);
        idQuestion.setFullPoints(15.0);
        idQuestion.setQuestionType(QuestionType.IDENTIFICATION);
        idQuestion.setCorrectAnswer("Paris");

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setQuestion(idQuestion);
        studentAnswer.setTextAnswer("London"); // Wrong answer

        List<StudentAnswerDto> answersToSubmit = List.of(studentAnswerDto);

        when(questionRepository.findById(100L)).thenReturn(Optional.of(idQuestion)); // Match DTO ID

        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(studentAnswer));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        studentAnswerDto.setOptionId(null);
        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertEquals(0.0, submission.getTotalScore());
        assertEquals(0.0, studentAnswer.getPoints());
    }

    @Test
    void submitTest_TrueFalseCorrectAnswer() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        Question tfQuestion = new Question();
        tfQuestion.setId(102L);
        tfQuestion.setFullPoints(5.0);
        tfQuestion.setQuestionType(QuestionType.TRUE_FALSE);
        tfQuestion.setCorrectAnswer("True");

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setQuestion(tfQuestion);
        studentAnswer.setTextAnswer("True");

        List<StudentAnswerDto> answersToSubmit = List.of(studentAnswerDto);

        when(questionRepository.findById(100L)).thenReturn(Optional.of(tfQuestion)); // Match DTO ID

        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(studentAnswer));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        studentAnswerDto.setOptionId(null);
        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertEquals(5.0, submission.getTotalScore());
        assertEquals(5.0, studentAnswer.getPoints());
    }

    @Test
    void submitTest_TrueFalseWrongAnswer() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        Question tfQuestion = new Question();
        tfQuestion.setId(102L);
        tfQuestion.setFullPoints(5.0);
        tfQuestion.setQuestionType(QuestionType.TRUE_FALSE);
        tfQuestion.setCorrectAnswer("True");

        StudentAnswer studentAnswer = new StudentAnswer();
        studentAnswer.setQuestion(tfQuestion);
        studentAnswer.setTextAnswer("False"); // Wrong answer

        List<StudentAnswerDto> answersToSubmit = List.of(studentAnswerDto);

        when(questionRepository.findById(100L)).thenReturn(Optional.of(tfQuestion)); // Match DTO ID

        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(studentAnswer));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        studentAnswerDto.setOptionId(null);
        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertEquals(0.0, submission.getTotalScore());
        assertEquals(0.0, studentAnswer.getPoints());
    }

    @Test
    void submitTest_MixedQuestions() {
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        // MCQ - Correct
        Question mcqQuestion = new Question();
        mcqQuestion.setId(100L);
        mcqQuestion.setFullPoints(10.0);
        mcqQuestion.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        mcqQuestion.setCorrectOptionId(10L);

        StudentAnswer mcqAnswer = new StudentAnswer();
        mcqAnswer.setQuestion(mcqQuestion);
        Option correctOption = new Option();
        correctOption.setId(10L);
        mcqAnswer.setOption(correctOption);

        // Identification - Wrong
        Question idQuestion = new Question();
        idQuestion.setId(101L);
        idQuestion.setFullPoints(15.0);
        idQuestion.setQuestionType(QuestionType.IDENTIFICATION);
        idQuestion.setCorrectAnswer("Paris");

        StudentAnswer idAnswer = new StudentAnswer();
        idAnswer.setQuestion(idQuestion);
        idAnswer.setTextAnswer("London");

        // TrueFalse - Correct
        Question tfQuestion = new Question();
        tfQuestion.setId(102L);
        tfQuestion.setFullPoints(5.0);
        tfQuestion.setQuestionType(QuestionType.TRUE_FALSE);
        tfQuestion.setCorrectAnswer("True");

        StudentAnswer tfAnswer = new StudentAnswer();
        tfAnswer.setQuestion(tfQuestion);
        tfAnswer.setTextAnswer("True");

        StudentAnswerDto mcqDto = new StudentAnswerDto();
        mcqDto.setOptionId(10L);
        com.athena.lms.athena_lms.dto.QuestionDto mcqQDto = new com.athena.lms.athena_lms.dto.QuestionDto();
        mcqQDto.setId(100L);
        mcqDto.setQuestion(mcqQDto);

        StudentAnswerDto idDto = new StudentAnswerDto();
        idDto.setTextAnswer("London");
        com.athena.lms.athena_lms.dto.QuestionDto idQDto = new com.athena.lms.athena_lms.dto.QuestionDto();
        idQDto.setId(101L);
        idDto.setQuestion(idQDto);

        StudentAnswerDto tfDto = new StudentAnswerDto();
        tfDto.setTextAnswer("True");
        com.athena.lms.athena_lms.dto.QuestionDto tfQDto = new com.athena.lms.athena_lms.dto.QuestionDto();
        tfQDto.setId(102L);
        tfDto.setQuestion(tfQDto);

        List<StudentAnswerDto> answersToSubmit = List.of(mcqDto, idDto, tfDto);

        // removed mapper mock
        when(optionRepository.findById(anyLong())).thenReturn(Optional.of(correctOption));

        // Fix: mock questionRepository for all questions
        when(questionRepository.findById(100L)).thenReturn(Optional.of(mcqQuestion));
        when(questionRepository.findById(101L)).thenReturn(Optional.of(idQuestion));
        when(questionRepository.findById(102L)).thenReturn(Optional.of(tfQuestion));

        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(mcqAnswer, idAnswer, tfAnswer));
        when(studentAnswerRepository.findBySubmissionId(1L)).thenReturn(List.of(mcqAnswer, idAnswer, tfAnswer));
        when(submissionRepository.save(submission)).thenReturn(submission);
        when(submissionMapper.toDto(submission)).thenReturn(submissionDto);

        SubmissionDto result = submissionService.submitTest(1L, answersToSubmit);

        assertNotNull(result);
        assertEquals(15.0, submission.getTotalScore()); // 10 (MCQ) + 0 (ID wrong) + 5 (TF) = 15
        assertEquals(10.0, mcqAnswer.getPoints());
        assertEquals(0.0, idAnswer.getPoints()); // Wrong answer
        assertEquals(5.0, tfAnswer.getPoints());
    }
}
