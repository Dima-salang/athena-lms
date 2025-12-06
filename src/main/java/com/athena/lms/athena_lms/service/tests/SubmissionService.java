package com.athena.lms.athena_lms.service.tests;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import com.athena.lms.athena_lms.repository.*;

import ch.qos.logback.core.util.Duration;

import com.athena.lms.athena_lms.mapper.SubmissionMapper;
import com.athena.lms.athena_lms.mapper.StudentAnswerMapper;
import com.athena.lms.athena_lms.dto.*;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.submission.*;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.tests.Test;
import java.util.Date;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final SubmissionMapper submissionMapper;
    private final StudentAnswerMapper studentAnswerMapper;
    private final TestRepository testRepository;
    private final UserRepository userRepository;
    private final OptionRepository optionRepository;

    public SubmissionService(SubmissionRepository submissionRepository,
            StudentAnswerRepository studentAnswerRepository, SubmissionMapper submissionMapper,
            StudentAnswerMapper studentAnswerMapper, TestRepository testRepository, UserRepository userRepository,
            OptionRepository optionRepository) {
        this.submissionRepository = submissionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.submissionMapper = submissionMapper;
        this.studentAnswerMapper = studentAnswerMapper;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
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
    public List<StudentAnswerDto> createOrUpdateStudentAnswers(List<StudentAnswerDto> studentAnswerDtos) {
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

            System.out.println("Option ID: " + studentAnswerDto.getOptionId());
            System.out.println("Question ID: " + studentAnswerDto.getQuestion().getId());
            System.out.println("StudentAnswer ID: " + studentAnswerDto.getId());
            System.out.println("Submission ID: " + studentAnswerDto.getSubmission().getId());
            System.out.println("Points: " + studentAnswerDto.getPoints());

            if (studentAnswerDto.getOptionId() != null) {
                Option option = optionRepository.findById(studentAnswerDto.getOptionId()).orElse(null);
                studentAnswer.setOption(option);
                System.out.println("Option ID after setting: " + option.getId());
            }
            studentAnswers.add(studentAnswer);
        }
        List<StudentAnswer> savedStudentAnswers = studentAnswerRepository.saveAll(studentAnswers);
        for (StudentAnswer savedStudentAnswer : savedStudentAnswers) {
            System.out.println("Saved Student Answer ID: " + savedStudentAnswer.getId());
        }
        return studentAnswerMapper.toDtoList(savedStudentAnswers);
    }

    public SubmissionDto startTest(Long testId, String username) {
        User user = userRepository.findByUsername(username);
        if (user == null || !(user instanceof Student)) {
            throw new RuntimeException("User not found or not a student");
        }
        Student student = (Student) user;

        Test test = testRepository.findById(testId).orElseThrow(() -> new RuntimeException("Test not found"));

        // Check if submission already exists
        Submission existingSubmission = submissionRepository.findFirstByTestIdAndStudentIdAndEndTimeIsNull(testId,
                student.getId());
        if (existingSubmission != null) {
            return submissionMapper.toDto(existingSubmission);
        }

        Submission submission = new Submission();
        submission.setTest(test);
        submission.setStudent(student);

        // make start time to now
        submission.setStartTime(Instant.now());

        // make end time to be start time + test duration
        submission.setEndTime(Instant.now().plus(test.getTestDuration()));

        submission.setCreatedAt(Instant.now());
        submission.setUpdatedAt(Instant.now());

        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    public List<StudentAnswerDto> getStudentAnswers(Long submissionId) {
        List<StudentAnswer> answers = studentAnswerRepository.findBySubmissionId(submissionId);
        return studentAnswerMapper.toDtoList(answers);
    }

    public SubmissionDto submitTest(Long submissionId, List<StudentAnswerDto> studentAnswerDtos) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // get test
        Test test = submission.getTest();

        // TODO - change this to Instant
        // check end time
        if (submission.getSubmittedAt().isAfter(test.getTestDueDate())) {
            throw new RuntimeException("Test has already ended");
        }

        submission.setUpdatedAt(Instant.now());

        // Save answers
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        for (StudentAnswerDto dto : studentAnswerDtos) {
            StudentAnswer answer = studentAnswerMapper.toEntity(dto);
            Option option = optionRepository.findById(dto.getOptionId())
                    .orElseThrow(() -> new RuntimeException("Option not found"));
            answer.setOption(option);
            answer.setSubmission(submission);
            // Ensure question and option are set correctly if needed,
            // but mapper should handle ID to entity if configured,
            // or we might need to fetch them if mapper is simple.
            // Assuming mapper handles basic mapping.
            // We might need to set Question and Option entities manually if mapper only
            // maps IDs.
            // Let's trust mapper for now or check if we need to fetch.
            // Actually, for safety, let's just save.
            studentAnswers.add(answer);
        }
        studentAnswerRepository.saveAll(studentAnswers);

        // Calculate score (Simple auto-grade for MCQ/Identification)
        // double totalScore = 0;
        // for (StudentAnswer answer : studentAnswers) {
        // Logic to grade...
        // }
        // submission.setTotalScore(totalScore);

        return submissionMapper.toDto(submissionRepository.save(submission));
    }
}
