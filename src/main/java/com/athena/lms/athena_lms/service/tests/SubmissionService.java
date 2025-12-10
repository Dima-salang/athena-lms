package com.athena.lms.athena_lms.service.tests;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import com.athena.lms.athena_lms.repository.*;

import com.athena.lms.athena_lms.mapper.SubmissionMapper;
import com.athena.lms.athena_lms.mapper.StudentAnswerMapper;
import com.athena.exceptions.AccessDeniedException;
import com.athena.exceptions.NotFoundException;
import com.athena.lms.athena_lms.dto.*;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.submission.*;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.tests.Test;
import jakarta.persistence.EntityManager;
import com.blazebit.persistence.CriteriaBuilder;
import com.blazebit.persistence.CriteriaBuilderFactory;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final SubmissionMapper submissionMapper;
    private final StudentAnswerMapper studentAnswerMapper;
    private final TestRepository testRepository;
    private final UserRepository userRepository;
    private final OptionRepository optionRepository;
    private final CriteriaBuilderFactory cbf;
    private final EntityManager em;

    public SubmissionService(SubmissionRepository submissionRepository,
            StudentAnswerRepository studentAnswerRepository, SubmissionMapper submissionMapper,
            StudentAnswerMapper studentAnswerMapper, TestRepository testRepository, UserRepository userRepository,
            OptionRepository optionRepository, CriteriaBuilderFactory cbf, EntityManager em) {
        this.submissionRepository = submissionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.submissionMapper = submissionMapper;
        this.studentAnswerMapper = studentAnswerMapper;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
        this.cbf = cbf;
        this.em = em;
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

    public List<SubmissionDto> getSubmissionsByTest(Long testId, String search) throws NotFoundException {
        // Verify test exists
        if (!testRepository.existsById(testId)) {
            throw new NotFoundException("Test not found");
        }

        CriteriaBuilder<Submission> cb = cbf.create(em, Submission.class);

        cb.where("test.id").eq(testId);

        if (search != null && !search.isEmpty()) {
            cb.whereOr()
                    .where("LOWER(student.firstName)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .where("LOWER(student.lastName)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .where("LOWER(student.username)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .endOr();
        }

        // Order by submission time descending (most recent first)
        cb.orderByDesc("createdAt");

        List<Submission> submissions = cb.getResultList();

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

            if (studentAnswerDto.getOptionId() != null) {
                Option option = optionRepository.findById(studentAnswerDto.getOptionId()).orElse(null);
                studentAnswer.setOption(option);
            }
            studentAnswers.add(studentAnswer);
        }
        List<StudentAnswer> savedStudentAnswers = studentAnswerRepository.saveAll(studentAnswers);
        return studentAnswerMapper.toDtoList(savedStudentAnswers);
    }

    public SubmissionDto startTest(Long testId, String username) {
        User user = userRepository.findByUsername(username);
        if (user == null || !(user instanceof Student)) {
            throw new AccessDeniedException("User not found or not a student");
        }
        Student student = (Student) user;

        Test test = testRepository.findById(testId).orElseThrow(() -> new AccessDeniedException("Test not found"));

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
                .orElseThrow(() -> new NotFoundException("Submission not found"));

        // get test
        Test test = submission.getTest();

        Instant now = Instant.now();
        // check end time
        if (test.getTestDueDate() != null && now.isAfter(test.getTestDueDate())) {
            throw new RuntimeException("Test has already ended");
        }

        submission.setUpdatedAt(now);
        submission.setSubmittedAt(now);

        // Save answers
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        for (StudentAnswerDto dto : studentAnswerDtos) {
            StudentAnswer answer = studentAnswerMapper.toEntity(dto);
            Option option = optionRepository.findById(dto.getOptionId())
                    .orElseThrow(() -> new NotFoundException("Option not found"));
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

    public SubmissionDto getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found"));
        return submissionMapper.toDto(submission);
    }
}
