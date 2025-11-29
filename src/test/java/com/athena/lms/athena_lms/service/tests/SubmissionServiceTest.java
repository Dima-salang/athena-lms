package com.athena.lms.athena_lms.service.tests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.athena.lms.athena_lms.dto.StudentAnswerDto;
import com.athena.lms.athena_lms.dto.SubmissionDto;
import com.athena.lms.athena_lms.mapper.StudentAnswerMapper;
import com.athena.lms.athena_lms.mapper.SubmissionMapper;
import com.athena.lms.athena_lms.model.submission.StudentAnswer;
import com.athena.lms.athena_lms.model.submission.Submission;
import com.athena.lms.athena_lms.repository.StudentAnswerRepository;
import com.athena.lms.athena_lms.repository.SubmissionRepository;

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

    @InjectMocks
    private SubmissionService submissionService;

    private Submission submission;
    private SubmissionDto submissionDto;
    private StudentAnswer studentAnswer;
    private StudentAnswerDto studentAnswerDto;

    @BeforeEach
    void setUp() {
        submission = new Submission();
        submission.setId(1L);

        submissionDto = new SubmissionDto();
        submissionDto.setId(1L);

        studentAnswer = new StudentAnswer();
        studentAnswer.setId(1L);

        studentAnswerDto = new StudentAnswerDto();
        studentAnswerDto.setId(1L);
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
        // Should NOT call toEntity if found (based on current implementation logic
        // check)
        // Logic: if (submission == null) { submission = mapper.toEntity(...) }
        verify(submissionMapper, never()).toEntity(any(SubmissionDto.class));
    }

    @Test
    void deleteSubmission_Success() {
        doNothing().when(submissionRepository).deleteById(1L);

        submissionService.deleteSubmission(1L);

        verify(submissionRepository).deleteById(1L);
    }

    @Test
    void getSubmissionsByTest_Success() {
        List<Submission> submissions = new ArrayList<>();
        submissions.add(submission);

        when(submissionRepository.findByTestId(100L)).thenReturn(submissions);
        when(submissionMapper.toDto(any(Submission.class))).thenReturn(submissionDto);

        List<SubmissionDto> results = submissionService.getSubmissionsByTest(100L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getId());
    }

    @Test
    void createOrUpdateStudentAnswers_NewAnswers_Success() {
        StudentAnswerDto newAnswerDto = new StudentAnswerDto(); // ID null
        List<StudentAnswerDto> dtos = List.of(newAnswerDto);

        StudentAnswer newEntity = new StudentAnswer();

        when(studentAnswerMapper.toEntity(any(StudentAnswerDto.class))).thenReturn(newEntity);
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(newEntity));
        when(studentAnswerMapper.toDtoList(anyList())).thenReturn(dtos);

        List<StudentAnswerDto> results = submissionService.createOrUpdateStudentAnswers(dtos);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(studentAnswerMapper).toEntity(newAnswerDto);
        verify(studentAnswerRepository).saveAll(anyList());
    }

    @Test
    void createOrUpdateStudentAnswers_ExistingAnswers_Success() {
        List<StudentAnswerDto> dtos = List.of(studentAnswerDto);

        when(studentAnswerRepository.findById(1L)).thenReturn(Optional.of(studentAnswer));
        doNothing().when(studentAnswerMapper).updateEntityFromDto(any(StudentAnswerDto.class),
                any(StudentAnswer.class));
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(studentAnswer));
        when(studentAnswerMapper.toDtoList(anyList())).thenReturn(dtos);

        List<StudentAnswerDto> results = submissionService.createOrUpdateStudentAnswers(dtos);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(studentAnswerRepository).findById(1L);
        verify(studentAnswerMapper).updateEntityFromDto(studentAnswerDto, studentAnswer);
        verify(studentAnswerRepository).saveAll(anyList());
    }

    @Test
    void getSubmissionsByTest_NoSubmissions_ReturnsEmptyList() {
        when(submissionRepository.findByTestId(100L)).thenReturn(new ArrayList<>());

        List<SubmissionDto> results = submissionService.getSubmissionsByTest(100L);

        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(submissionRepository).findByTestId(100L);
        verify(submissionMapper, never()).toDto(any(Submission.class));
    }

    @Test
    void createOrUpdateStudentAnswers_MixedNewAndExisting_Success() {
        StudentAnswerDto newDto = new StudentAnswerDto(); // ID null
        StudentAnswerDto existingDto = new StudentAnswerDto();
        existingDto.setId(1L);

        List<StudentAnswerDto> dtos = List.of(newDto, existingDto);

        StudentAnswer newEntity = new StudentAnswer();
        StudentAnswer existingEntity = new StudentAnswer();
        existingEntity.setId(1L);

        // Mock for new answer
        when(studentAnswerMapper.toEntity(newDto)).thenReturn(newEntity);

        // Mock for existing answer
        when(studentAnswerRepository.findById(1L)).thenReturn(Optional.of(existingEntity));
        doNothing().when(studentAnswerMapper).updateEntityFromDto(existingDto, existingEntity);

        // Mock saveAll
        when(studentAnswerRepository.saveAll(anyList())).thenReturn(List.of(newEntity, existingEntity));
        when(studentAnswerMapper.toDtoList(anyList())).thenReturn(dtos);

        List<StudentAnswerDto> results = submissionService.createOrUpdateStudentAnswers(dtos);

        assertNotNull(results);
        assertEquals(2, results.size());
        verify(studentAnswerMapper).toEntity(newDto);
        verify(studentAnswerRepository).findById(1L);
        verify(studentAnswerMapper).updateEntityFromDto(existingDto, existingEntity);
        verify(studentAnswerRepository).saveAll(anyList());
    }
}
