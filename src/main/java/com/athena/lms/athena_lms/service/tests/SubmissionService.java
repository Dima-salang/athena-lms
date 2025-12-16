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
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.questions.QuestionType;
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
    private final QuestionRepository questionRepository;
    private final CriteriaBuilderFactory cbf;
    private final EntityManager em;

    public SubmissionService(SubmissionRepository submissionRepository,
            StudentAnswerRepository studentAnswerRepository, SubmissionMapper submissionMapper,
            StudentAnswerMapper studentAnswerMapper, TestRepository testRepository, UserRepository userRepository,
            OptionRepository optionRepository, QuestionRepository questionRepository,
            CriteriaBuilderFactory cbf, EntityManager em) {
        this.submissionRepository = submissionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.submissionMapper = submissionMapper;
        this.studentAnswerMapper = studentAnswerMapper;
        this.testRepository = testRepository;
        this.userRepository = userRepository;
        this.optionRepository = optionRepository;
        this.questionRepository = questionRepository;
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

        cb.where("test.id").eq(testId).where("submittedAt").isNotNull();

        if (search != null && !search.isEmpty()) {
            cb.whereOr()
                    .where("LOWER(student.firstName)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .where("LOWER(student.lastName)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .where("LOWER(student.username)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .endOr();
        }

        // Order by submission time descending (most recent first)
        cb.orderByDesc("submittedAt");

        List<Submission> submissions = cb.getResultList();

        // Map submissions to submissionDtos
        List<SubmissionDto> submissionDtos = new ArrayList<>();
        for (Submission submission : submissions) {
            submissionDtos.add(submissionMapper.toDto(submission));
        }
        return submissionDtos;
    }

    public List<SubmissionDto> getStudentSubmissions(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null || !(user instanceof Student)) {
            throw new AccessDeniedException("User not found or not a student");
        }
        List<Submission> submissions = submissionRepository.findByStudentId(user.getId());
        List<SubmissionDto> result = new ArrayList<>();
        for (Submission s : submissions) {
            result.add(submissionMapper.toDto(s));
        }
        return result;
    }

    @org.springframework.transaction.annotation.Transactional
    public List<StudentAnswerDto> createOrUpdateStudentAnswers(List<StudentAnswerDto> studentAnswerDtos) {
        List<StudentAnswer> studentAnswers = new ArrayList<>();

        // update the entity from the db or create it
        for (StudentAnswerDto studentAnswerDto : studentAnswerDtos) {
            StudentAnswer studentAnswer;
            if (studentAnswerDto.getId() == null) {
                // Create new answer - don't use mapper to avoid transient entities
                studentAnswer = new StudentAnswer();
                studentAnswer.setTextAnswer(studentAnswerDto.getTextAnswer());
                studentAnswer.setPoints(studentAnswerDto.getPoints());
            } else {
                // Update existing answer
                studentAnswer = studentAnswerRepository.findById(studentAnswerDto.getId())
                        .orElseThrow(() -> new NotFoundException("Student answer not found"));
                studentAnswer.setTextAnswer(studentAnswerDto.getTextAnswer());
                studentAnswer.setPoints(studentAnswerDto.getPoints());
            }

            // Fetch and set managed entities from database
            if (studentAnswerDto.getSubmission() != null && studentAnswerDto.getSubmission().getId() != null) {
                Submission submission = submissionRepository.findById(studentAnswerDto.getSubmission().getId())
                        .orElseThrow(() -> new NotFoundException("Submission not found"));
                studentAnswer.setSubmission(submission);
            }

            if (studentAnswerDto.getQuestion() != null && studentAnswerDto.getQuestion().getId() != null) {
                Question question = questionRepository.findById(studentAnswerDto.getQuestion().getId())
                        .orElseThrow(() -> new NotFoundException("Question not found"));
                studentAnswer.setQuestion(question);
            }

            if (studentAnswerDto.getOptionId() != null) {
                Option option = optionRepository.findById(studentAnswerDto.getOptionId())
                        .orElseThrow(() -> new NotFoundException("Option not found"));
                studentAnswer.setOption(option);
            } else {
                // Clear option if null (for text-based answers)
                studentAnswer.setOption(null);
            }

            studentAnswers.add(studentAnswer);
        }
        List<StudentAnswer> savedStudentAnswers = studentAnswerRepository.saveAll(studentAnswers);
        return studentAnswerMapper.toDtoList(savedStudentAnswers);
    }

    // manual override of score for a student answer
    @org.springframework.transaction.annotation.Transactional
    public void manualSetStudentAnswerScore(Long studentAnswerId, Double score) {
        StudentAnswer studentAnswer = studentAnswerRepository.findById(studentAnswerId)
                .orElseThrow(() -> new NotFoundException("Student answer not found"));

        // validate score
        if (score < 0 || score > studentAnswer.getQuestion().getFullPoints()) {
            throw new IllegalArgumentException(
                    "Score must be between 0 and " + studentAnswer.getQuestion().getFullPoints());
        }

        studentAnswer.setPoints(score);
        studentAnswerRepository.save(studentAnswer);

        // Update total score
    }

    @org.springframework.transaction.annotation.Transactional
    public SubmissionDto startTest(Long testId, String username) {
        User user = userRepository.findByUsername(username);
        if (user == null || !(user instanceof Student)) {
            throw new AccessDeniedException("User not found or not a student");
        }
        Student student = (Student) user;

        Test test = testRepository.findById(testId).orElseThrow(() -> new AccessDeniedException("Test not found"));

        // Check if submission already exists (not yet submitted)
        Submission existingSubmission = submissionRepository.findFirstByTestIdAndStudentIdAndSubmittedAtIsNull(testId,
                student.getId());
        if (existingSubmission != null) {
            return submissionMapper.toDto(existingSubmission);
        }

        // check if submission already exists (submitted)
        Submission submittedSubmission = submissionRepository.findFirstByTestIdAndStudentIdAndSubmittedAtIsNotNull(
                testId,
                student.getId());
        if (submittedSubmission != null) {
            throw new AccessDeniedException("You have already submitted this test");
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
        submission.setSubmittedAt(null);

        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    public List<StudentAnswerDto> getStudentAnswers(Long submissionId) {
        List<StudentAnswer> answers = studentAnswerRepository.findBySubmissionId(submissionId);
        return studentAnswerMapper.toDtoList(answers);
    }

    @org.springframework.transaction.annotation.Transactional
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
            // Create new answer - don't use mapper to avoid transient entities
            StudentAnswer answer = new StudentAnswer();
            answer.setTextAnswer(dto.getTextAnswer());
            answer.setPoints(dto.getPoints());

            // Set the submission (already managed)
            answer.setSubmission(submission);

            // Fetch and set managed Question entity
            if (dto.getQuestion() != null && dto.getQuestion().getId() != null) {
                Question question = questionRepository.findById(dto.getQuestion().getId())
                        .orElseThrow(() -> new NotFoundException("Question not found"));
                answer.setQuestion(question);
            }

            // Only fetch option if optionId is not null (for MCQ/TrueFalse with options)
            if (dto.getOptionId() != null) {
                Option option = optionRepository.findById(dto.getOptionId())
                        .orElseThrow(() -> new NotFoundException("Option not found"));
                answer.setOption(option);
            }

            studentAnswers.add(answer);
        }
        studentAnswerRepository.saveAll(studentAnswers);

        calculateScore(submission);

        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    /*
     * Recalculates the score of a specific submission or all submissions of a test
     */
    public void recalculateSubmissionTotal(Long submissionId) {
        recalculateSubmission(submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found")));
    }

    /*
     * Re-runs auto-grading logic for a specific submission
     */
    public void autoGradeSubmission(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found"));
        calculateScore(submission); // This is the auto-grading logic (re-evaluates answers)
        submissionRepository.save(submission);
    }

    /*
     * Re-runs auto-grading logic for ALL submissions of a test
     */
    public void autoGradeTestSubmissions(Long testId) {
        List<Submission> submissions = submissionRepository.findByTestId(testId);
        for (Submission submission : submissions) {
            autoGradeSubmission(submission.getId());
        }
    }

    public void recalculateSubmission(Submission submission) {
        // We recalculate by summing up current points of answers.
        // If we use calculateScore(submission), it might reset points based on
        // auto-grading logic.
        // The user asked for "recalculating the score for a specific submission or
        // calculating".
        // If "calculating", it implies auto-grading.
        // If "recalculating" after manual override, it should just sum them up?
        // But calculateScore implementation currently does auto-grading logic (checking
        // correct answers).
        // This would OVERWRITE manual scores.

        // Wait, if manual override is done, we don't want to loose it on recalculation
        // UNLESS explicitly requested to "Auto-grade".
        // BUT, the prompt says "recalculating the score...". Usually this implies
        // summing up.
        // However, calculateScore() as written DOES auto-grading.

        // Let's separate "SUMMING" from "AUTO-GRADING".

        double totalScore = studentAnswerRepository.findBySubmissionId(submission.getId()).stream()
                .mapToDouble(a -> a.getPoints() != null ? a.getPoints() : 0.0)
                .sum();
        submission.setTotalScore(totalScore);
        submissionRepository.save(submission);
    }

    private void calculateScore(Submission submission) {
        double totalScore = 0;
        List<StudentAnswer> studentAnswers = studentAnswerRepository.findBySubmissionId(submission.getId());
        for (StudentAnswer answer : studentAnswers) {
            Question question = answer.getQuestion();
            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                Option option = answer.getOption();
                if (option == null) {
                    answer.setPoints(0.0);
                } else {
                    // Use equals for Long comparison
                    if (option.getId() != null && option.getId().equals(question.getCorrectOptionId())) {
                        double fullPoints = question.getFullPoints();
                        totalScore += fullPoints;
                        answer.setPoints(fullPoints);
                    } else {
                        answer.setPoints(0.0);
                    }
                }
            } else if (question.getQuestionType() == QuestionType.IDENTIFICATION) {
                String textAnswer = answer.getTextAnswer();
                if (textAnswer != null && textAnswer.equals(question.getCorrectAnswer())) {
                    double fullPoints = question.getFullPoints();
                    totalScore += fullPoints;
                    answer.setPoints(fullPoints);
                } else {
                    answer.setPoints(0.0);
                }
            } else if (question.getQuestionType() == QuestionType.TRUE_FALSE) {
                if (answer.getTextAnswer() != null && answer.getTextAnswer().equals(question.getCorrectAnswer())) {
                    double fullPoints = question.getFullPoints();
                    totalScore += fullPoints;
                    answer.setPoints(fullPoints);
                } else {
                    answer.setPoints(0.0);
                }
            }
            // For Essay/Manual, typically 0 initially unless graded.
            else if (answer.getPoints() != null) {
                totalScore += answer.getPoints();
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
