package com.athena.lms.athena_lms.service.tests;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import com.athena.lms.athena_lms.repository.SubmissionRepository;
import com.athena.lms.athena_lms.repository.StudentAnswerRepository;
import com.athena.lms.athena_lms.mapper.SubmissionMapper;
import com.athena.lms.athena_lms.mapper.StudentAnswerMapper;
import com.athena.lms.athena_lms.dto.*;
import com.athena.lms.athena_lms.model.submission.*;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final SubmissionMapper submissionMapper;
    private final StudentAnswerMapper studentAnswerMapper;

    public SubmissionService(SubmissionRepository submissionRepository,
            StudentAnswerRepository studentAnswerRepository, SubmissionMapper submissionMapper,
            StudentAnswerMapper studentAnswerMapper) {
        this.submissionRepository = submissionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.submissionMapper = submissionMapper;
        this.studentAnswerMapper = studentAnswerMapper;
    }

    public SubmissionDto createOrUpdateSubmission(SubmissionDto submissionDto) {
        Submission submission = submissionRepository.findById(submissionDto.getId()).orElse(null);
        if (submission == null) {
            submission = submissionMapper.toEntity(submissionDto);
        }
        Submission savedSubmission = submissionRepository.save(submission);
        return submissionMapper.toDto(savedSubmission);
    }

    public void deleteSubmission(Long submissionId) {
        submissionRepository.deleteById(submissionId);
    }

    public List<SubmissionDto> getSubmissionsByTest(Long testId) {
        List<Submission> submissions = submissionRepository.findByTestId(testId);
        // Map submissions to submissionDtos
        List<SubmissionDto> submissionDtos = new ArrayList<>();
        for (Submission submission : submissions) {
            submissionDtos.add(submissionMapper.toDto(submission));
        }
        return submissionDtos;
    }

    // student answers
    public List<StudentAnswerDto> createorUpdateStudentAnswers(List<StudentAnswerDto> studentAnswerDtos) {
        List<StudentAnswer> studentAnswers = new ArrayList<>();

        // update the entity from the db or create it
        for (StudentAnswerDto studentAnswerDto : studentAnswerDtos) {
            StudentAnswer studentAnswer;
            if (studentAnswerDto.getId() == null) {
                studentAnswer = studentAnswerMapper.toEntity(studentAnswerDto);
                studentAnswer.setId(null);
            } else {
                studentAnswer = studentAnswerRepository.findById(studentAnswerDto.getId()).orElse(null);
                studentAnswerMapper.updateEntityFromDto(studentAnswerDto, studentAnswer);
            }
            studentAnswers.add(studentAnswer);
        }
        List<StudentAnswer> savedStudentAnswers = studentAnswerRepository.saveAll(studentAnswers);
        return studentAnswerMapper.toDtoList(savedStudentAnswers);
    }

}
