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
import com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.questions.TrueFalseQuestion;
import com.athena.lms.athena_lms.model.submission.*;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.questions.IdentificationQuestion;
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

            // Only fetch option if optionId is not null (for MCQ/TrueFalse with options)
            if (dto.getOptionId() != null) {
                Option option = optionRepository.findById(dto.getOptionId())
                        .orElseThrow(() -> new NotFoundException("Option not found"));
                answer.setOption(option);
            }

            answer.setSubmission(submission);
            studentAnswers.add(answer);
        }
        studentAnswerRepository.saveAll(studentAnswers);

        calculateScore(submission);

        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    private void calculateScore(Submission submission) {
        double totalScore = 0;
        List<StudentAnswer> studentAnswers = studentAnswerRepository.findBySubmissionId(submission.getId());
        for (StudentAnswer answer : studentAnswers) {
            Question question = answer.getQuestion();
            if (question instanceof MultipleChoiceQuestion) {
                MultipleChoiceQuestion multipleChoiceQuestion = (MultipleChoiceQuestion) question;
                Option option = answer.getOption();
                if (option.getId() == multipleChoiceQuestion.getCorrectOptionId()) {
                    // get the full points for the question
                    double mcqFullPoints = multipleChoiceQuestion.getFullPoints();

                    // add it to the total score
                    totalScore += mcqFullPoints;

                    // set the points for the student answer
                    answer.setPoints(mcqFullPoints);
                } else {
                    // we set the points to 0.0 if the answer is wrong
                    answer.setPoints(0.0);
                }
            } else if (question instanceof IdentificationQuestion) {
                IdentificationQuestion identificationQuestion = (IdentificationQuestion) question;
                String textAnswer = answer.getTextAnswer();
                if (textAnswer.equals(identificationQuestion.getCorrectAnswer())) {
                    // get the full points for the question
                    double identificationFullPoints = identificationQuestion.getFullPoints();

                    // add it to the total score
                    totalScore += identificationFullPoints;

                    // set the points for the student answer
                    answer.setPoints(identificationFullPoints);
                } else {
                    answer.setPoints(0.0);
                }
            } else if (question instanceof TrueFalseQuestion) {
                TrueFalseQuestion trueFalseQuestion = (TrueFalseQuestion) question;
                if (answer.getTextAnswer().equals(trueFalseQuestion.getCorrectAnswer())) {
                    // get the full points for the question
                    double trueFalseFullPoints = trueFalseQuestion.getFullPoints();

                    // add it to the total score
                    totalScore += trueFalseFullPoints;

                    // set the points for the student answer
                    answer.setPoints(trueFalseFullPoints);
                } else {
                    answer.setPoints(0.0);
                }
            }
        }
        submission.setTotalScore(totalScore);
    }

    public SubmissionDto getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found"));
        return submissionMapper.toDto(submission);
    }
}
