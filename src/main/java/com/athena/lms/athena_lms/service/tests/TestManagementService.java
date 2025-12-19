package com.athena.lms.athena_lms.service.tests;

import java.util.ArrayList;
import java.util.List;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.athena.exceptions.AccessDeniedException;
import com.athena.lms.athena_lms.dto.QuestionDto;
import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.mapper.QuestionMapper;
import com.athena.lms.athena_lms.mapper.TestMapper;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.TeacherAssignment;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.questions.QuestionType;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.repository.QuestionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.TeacherAssignmentRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;
import com.blazebit.persistence.CriteriaBuilderFactory;
import com.blazebit.persistence.PagedList;
import com.blazebit.persistence.CriteriaBuilder;

import jakarta.persistence.EntityManager;

import com.athena.lms.athena_lms.repository.OptionRepository;
import com.athena.lms.athena_lms.repository.StudentAnswerRepository;
import com.athena.lms.athena_lms.mapper.OptionMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@Service
public class TestManagementService {
    private static final Logger logger = LoggerFactory.getLogger(TestManagementService.class);

    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final StudentAnswerRepository studentAnswerRepository;
    private final TestMapper testMapper;
    private final QuestionMapper questionMapper;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final OptionMapper optionMapper;
    private final CriteriaBuilderFactory cbf;
    private final EntityManager em;

    public TestManagementService(UserRepository userRepository, TestRepository testRepository,
            QuestionRepository questionRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            OptionRepository optionRepository,
            StudentAnswerRepository studentAnswerRepository,
            TestMapper testMapper,
            QuestionMapper questionMapper,
            OptionMapper optionMapper,
            TeacherAssignmentRepository teacherAssignmentRepository,
            CriteriaBuilderFactory cbf,
            EntityManager em) {

        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.studentAnswerRepository = studentAnswerRepository;
        this.testMapper = testMapper;
        this.questionMapper = questionMapper;
        this.optionMapper = optionMapper;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.cbf = cbf;
        this.em = em;
    }

    public TestDto createTest(TestDto testDto, String username) {
        logger.info("Creating test '{}' by user '{}'", testDto.getTestName(), username);
        if (testDto.getId() != null && testRepository.existsById(testDto.getId())) {
            return updateTest(testDto.getId(), testDto);
        }

        Test test = testMapper.toEntity(testDto);

        // Handle Teacher
        User user = userRepository.findByUsername(username);
        if (!(user instanceof Teacher)) {
            throw new AccessDeniedException("Current user is not a teacher");
        }
        test.setTeacher((Teacher) user);

        Long subjectId = testDto.getSubjectId();
        if (subjectId == null && testDto.getSubject() != null) {
            subjectId = testDto.getSubject().getId();
        }

        Long sectionId = testDto.getSectionId();
        if (sectionId == null && testDto.getSection() != null) {
            sectionId = testDto.getSection().getId();
        }

        // see if there is a teacher assignment for the teacher
        boolean teacherAssignmentExists = teacherAssignmentRepository.existsByTeacherIdAndSubjectIdAndSectionId(
                user.getId(), subjectId, sectionId);
        if (!teacherAssignmentExists) {
            throw new AccessDeniedException("You are not assigned to this subject and section");
        }

        // Handle Subject
        if (testDto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(testDto.getSubjectId()).orElse(null);
            if (subject != null) {
                test.setSubject(subject);
            }
        } else if (testDto.getSubject() != null) {
            if (testDto.getSubject().getId() != null) {
                Subject subject = subjectRepository.findById(testDto.getSubject().getId()).orElse(null);
                if (subject != null) {
                    test.setSubject(subject);
                }
            } else if (testDto.getSubject().getName() != null) {
                Subject existingSubject = subjectRepository.findByName(testDto.getSubject().getName());
                if (existingSubject != null) {
                    test.setSubject(existingSubject);
                } else {
                    Subject newSubject = new Subject();
                    newSubject.setName(testDto.getSubject().getName());
                    newSubject.setDescription(testDto.getSubject().getDescription());
                    test.setSubject(subjectRepository.save(newSubject));
                }
            }
        }

        // Handle Section
        if (testDto.getSectionId() != null) {
            Section section = sectionRepository.findById(testDto.getSectionId()).orElse(null);
            if (section != null) {
                test.setSection(section);
            }
        } else if (testDto.getSection() != null) {
            if (testDto.getSection().getId() != null) {
                Section section = sectionRepository.findById(testDto.getSection().getId()).orElse(null);
                if (section != null) {
                    test.setSection(section);
                }
            } else if (testDto.getSection().getName() != null) {
                String sectionName = testDto.getSection().getName();
                if (!sectionName.isEmpty()) {
                    Section existingSection = sectionRepository.findByName(sectionName);
                    if (existingSection != null) {
                        test.setSection(existingSection);
                    } else {
                        Section newSection = new Section();
                        newSection.setName(sectionName);
                        test.setSection(sectionRepository.save(newSection));
                    }
                }
            }
        }

        List<Question> questions = test.getQuestions();
        // Handle Questions (Bidirectional relationship)
        if (questions != null) {
            for (Question question : questions) {
                question.setTest(test);
                // Handle negative IDs
                if (question.getId() != null && question.getId() < 0) {
                    question.setId(null);
                }

                if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                    List<Option> options = question.getOptions();
                    if (options != null) {
                        for (Option option : options) {
                            option.setQuestion(question);
                            option.setTest(test);
                            // Handle negative Option IDs
                            if (option.getId() != null && option.getId() < 0) {
                                option.setId(null);
                            }
                        }
                    }
                }
            }
        }

        test.setCreatedAt(Instant.now());
        test.setUpdatedAt(Instant.now());

        Test savedTest = testRepository.save(test);
        logger.info("Test created successfully. ID: {}", savedTest.getId());
        return testMapper.toDto(savedTest);
    }

    // update test
    public TestDto autosaveTest(Long id, TestDto testDto) {
        logger.debug("Autosaving test ID: {}", id);
        Test existingTest = testRepository.findById(id).orElseThrow(() -> new AccessDeniedException("Test not found"));

        // Update fields
        if (testDto.getTestName() != null)
            existingTest.setTestName(testDto.getTestName());
        if (testDto.getTestIssueDate() != null)
            existingTest.setTestIssueDate(testDto.getTestIssueDate());
        if (testDto.getTestDueDate() != null)
            existingTest.setTestDueDate(testDto.getTestDueDate());
        if (testDto.getTestDuration() != null) {
            existingTest.setTestDuration(java.time.Duration.ofSeconds(testDto.getTestDuration()));
        } else {
            existingTest.setHasInfiniteTime(true);
        }

        if (testDto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(testDto.getSubject().getId()).orElse(null);
            if (subject != null)
                existingTest.setSubject(subject);
        }

        if (testDto.getSectionId() != null) {
            Section section = sectionRepository.findById(testDto.getSectionId()).orElse(null);
            if (section != null)
                existingTest.setSection(section);
        }

        // save
        existingTest.setUpdatedAt(Instant.now());
        Test savedTest = testRepository.save(existingTest);

        return testMapper.toDto(savedTest);
    }

    public TestDto updateTest(Long id, TestDto testDto) {
        logger.info("Updating test ID: {}", id);
        Test existingTest = testRepository.findById(id).orElseThrow(() -> new RuntimeException("Test not found"));

        // Update fields
        if (testDto.getTestName() != null)
            existingTest.setTestName(testDto.getTestName());
        if (testDto.getTestIssueDate() != null)
            existingTest.setTestIssueDate(testDto.getTestIssueDate());
        if (testDto.getTestDueDate() != null)
            existingTest.setTestDueDate(testDto.getTestDueDate());
        if (testDto.getTestDuration() != null)
            existingTest.setTestDuration(java.time.Duration.ofSeconds(testDto.getTestDuration()));

        if (testDto.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(testDto.getSubjectId()).orElse(null);
            if (subject != null)
                existingTest.setSubject(subject);
        }

        if (testDto.getSectionId() != null) {
            Section section = sectionRepository.findById(testDto.getSectionId()).orElse(null);
            if (section != null)
                existingTest.setSection(section);
        }

        // update the questions and options
        List<QuestionDto> questions = testDto.getQuestions();
        if (questions != null) {
            List<Question> updatedQuestions = new java.util.ArrayList<>();
            for (QuestionDto questionDto : questions) {
                Question question;
                if (questionDto.getId() != null) {
                    question = questionRepository.findById(questionDto.getId()).orElse(null);
                    if (question == null) {
                        // If ID provided but not found, treat as new or skip?
                        // Let's treat as new but we need to be careful with ID.
                        // Ideally, if ID is passed, it should exist.
                        // If it's a new question from frontend, ID should be null.
                        // If frontend sends negative ID, we should have stripped it.
                        // Let's assume if not found, we create new.
                        question = questionMapper.toEntity(questionDto);
                        question.setId(null); // Ensure it's treated as new
                    } else {
                        // Update existing question fields
                        // We can use a mapper method to update target, but for now manual or simple
                        // mapping
                        // Re-mapping to entity might lose some context if not careful,
                        // but QuestionDto should have all data.
                        // Let's use the mapper to create a new entity instance and copy properties or
                        // use it to replace.
                        // But we want to keep the same persistence object if possible.
                        // For simplicity in this context, let's update key fields.
                        question.setQuestionText(questionDto.getQuestionText());
                        question.setQuestionNumber(questionDto.getQuestionNumber());
                        question.setFullPoints(questionDto.getFullPoints());
                        question.setCorrectPoints(questionDto.getCorrectPoints());
                        // Update specific fields based on type
                        if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                            question.setCorrectAnswer(questionDto.getCorrectAnswer());
                            question.setCorrectOptionId(questionDto.getCorrectOptionId());

                            // Options update: simple replace for now
                            final Question finalQuestion = question;
                            List<Option> newOptions = questionDto.getOptions()
                                    .stream()
                                    .map(o -> {
                                        Option opt = new Option();
                                        opt.setOptionText(o.getOptionText());
                                        opt.setQuestion(finalQuestion);
                                        opt.setTest(existingTest);
                                        return opt;
                                    }).toList();
                            // We need to delete old options?
                            // For simplicity, update list reference
                            question.setOptions(newOptions);
                        } else if (question.getQuestionType() == QuestionType.IDENTIFICATION
                                || question.getQuestionType() == QuestionType.TRUE_FALSE) {
                            question.setCorrectAnswer(questionDto.getCorrectAnswer());
                        }
                    }
                } else {
                    question = questionMapper.toEntity(questionDto);
                }

                question.setTest(existingTest);

                // Ensure options have relationships set for new questions too
                if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE && question.getOptions() != null) {
                    for (Option option : question.getOptions()) {
                        option.setQuestion(question);
                        option.setTest(existingTest);
                    }
                }
                updatedQuestions.add(question);
            }
            // Save all questions.
            // Note: This doesn't delete questions removed from the list.
            // If we want to support deletion via this list update, we need to find diff.
            // For autosave, usually we just save what's there. Deletion might be explicit.
            questionRepository.saveAll(updatedQuestions);
        }
        existingTest.setUpdatedAt(Instant.now());

        return testMapper.toDto(testRepository.save(existingTest));
    }

    public TestDto getTestById(Long id) {
        Test test = testRepository.findById(id).orElse(null);
        return test != null ? testMapper.toDto(test) : null;
    }

    public List<TestDto> getAllTests() {
        return testRepository.findAll().stream()
                .map(testMapper::toDto)
                .toList();
    }

    public Page<TestDto> getTeacherTests(Long teacherId, Pageable pageable, String search) {
        // validate the id
        User user = userRepository.findById(teacherId).orElse(null);
        if (!(user instanceof Teacher)) {
            throw new AccessDeniedException("User not found");
        }

        CriteriaBuilder<Test> cb = cbf.create(em, Test.class).where("teacher.id").eq(teacherId);

        if (search != null && !search.isEmpty()) {
            String searchPattern = "%" + search + "%";
            cb.whereOr()
                    .where("LOWER(TestName)").like(false).value(searchPattern).noEscape()
                    .where("LOWER(TestDescription)").like(false).value(searchPattern).noEscape()
                    .where("LOWER(section.name)").like(false).value(searchPattern).noEscape()
                    .where("LOWER(subject.name)").like(false).value(searchPattern).noEscape()
                    .endOr();
        }

        cb.orderByDesc("createdAt")
                .orderByDesc("id");

        PagedList<Test> pagedList = cb.page(pageable.getPageNumber() * pageable.getPageSize(), pageable.getPageSize())
                .getResultList();

        return new PageImpl<>(pagedList.stream()
                .map(testMapper::toDto)
                .toList(), pageable, pagedList.getTotalSize());
    }

    public void deleteTest(Long id) {
        logger.info("Deleting test ID: {}", id);
        testRepository.deleteById(id);
    }

    public Page<TestDto> getTestsBySection(Long sectionId, Pageable pageable, String search) {

        CriteriaBuilder<Test> cb = cbf.create(em, Test.class).where("section.id").eq(sectionId);

        Instant now = Instant.now();
        cb.where("TestIssueDate").le(now);

        if (search != null && !search.isEmpty()) {
            String searchPattern = "%" + search + "%";
            cb.whereOr()
                    .where("LOWER(TestName)").like(false).value(searchPattern).noEscape()
                    .where("LOWER(TestDescription)").like(false).value(searchPattern).noEscape()
                    .where("LOWER(subject.name)").like(false).value(searchPattern).noEscape()
                    .endOr();
        }

        // rank the tests by due date priority

        cb.orderByAsc(
                "CASE WHEN TestDueDate >= :now THEN 0 ELSE 1 END");

        cb.orderByAsc(
                "CASE WHEN TestDueDate >= :now THEN TestDueDate ELSE NULL END");

        cb.orderByDesc(
                "CASE WHEN TestDueDate < :now THEN TestDueDate ELSE NULL END");

        cb.orderByDesc("id");
        cb.setParameter("now", now);

        PagedList<Test> pagedList = cb.page(pageable.getPageNumber() * pageable.getPageSize(), pageable.getPageSize())
                .getResultList();

        return new PageImpl<>(pagedList.stream()
                .map(testMapper::toDto)
                .toList(), pageable, pagedList.getTotalSize());
    }

    public List<TestDto> getTestsBySubject(Long subjectId) {
        return testRepository.findBySubjectId(subjectId).stream()
                .map(testMapper::toDto)
                .toList();
    }

    public List<QuestionDto> createQuestions(List<QuestionDto> questionDtos, Long testId) {
        logger.info("Adding questions to test ID: {}", testId);
        // save the questions on the test list
        Test test = testRepository.findById(testId).orElseThrow(() -> new RuntimeException("Test not found"));

        List<Question> questions = questionDtos.stream()
                .map(questionMapper::toEntity)
                .toList();

        for (Question question : questions) {
            question.setTest(test);
            // Handle negative IDs
            if (question.getId() != null && question.getId() < 0) {
                question.setId(null);
            }

            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE && question.getOptions() != null) {
                for (Option option : question.getOptions()) {
                    option.setQuestion(question);
                    option.setTest(test);
                    // Handle negative Option IDs
                    if (option.getId() != null && option.getId() < 0) {
                        option.setId(null);
                    }
                }
            }
        }

        List<Question> savedQuestions = questionRepository.saveAll(questions);

        if (test.getQuestions() == null) {
            test.setQuestions(new java.util.ArrayList<>());
        }
        test.getQuestions().addAll(savedQuestions);
        test.setUpdatedAt(Instant.now());
        testRepository.save(test); // Optional if cascading, but ensures update

        return savedQuestions.stream()
                .map(questionMapper::toDto)
                .toList();
    }

    // creates or updates the delta of the questions instead of the whole test in
    // autosaving
    public List<QuestionDto> createOrUpdateQuestions(List<QuestionDto> questionDtos, Long testId) {
        logger.debug("Autosaving questions for test ID: {}", testId);
        Test test = testRepository.findById(testId).orElse(null);
        if (test == null) {
            throw new AccessDeniedException("Test not found");
        }

        List<Question> toSaveQuestions = new ArrayList<>();

        for (QuestionDto questionDto : questionDtos) {
            // look if the question exists
            Question question = null;
            if (questionDto.getId() != null && questionDto.getId() > 0) {
                question = questionRepository.findById(questionDto.getId()).orElse(null);
            }

            if (question == null) {
                question = questionMapper.toEntity(questionDto);
                // If ID is negative, it's a temp ID. Nullify it for persistence.
                if (question.getId() != null && question.getId() < 0) {
                    question.setId(null);
                }
            }

            // general question fields
            // update the fields
            question.setQuestionNumber(questionDto.getQuestionNumber());
            question.setQuestionText(questionDto.getQuestionText());
            question.setFullPoints(questionDto.getFullPoints());
            question.setCorrectPoints(questionDto.getCorrectPoints());
            question.setQuestionType(QuestionType.valueOf(questionDto.getQuestionType()));
            question.setTest(test);

            // handle the specific question types
            question = handleSpecificQuestions(question, questionDto, test);

            toSaveQuestions.add(question);
        }

        List<Question> savedQuestions = questionRepository.saveAll(toSaveQuestions);

        if (test.getQuestions() == null) {
            test.setQuestions(new ArrayList<>());
        }
        test.getQuestions().addAll(savedQuestions);
        test.setUpdatedAt(Instant.now());
        testRepository.save(test); // Optional if cascading, but ensures update

        return savedQuestions.stream()
                .map(questionMapper::toDto)
                .toList();
    }

    private Question handleSpecificQuestions(Question question, QuestionDto questionDto, Test test) {
        // Set common type-specific fields
        if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
            question.setCorrectAnswer(questionDto.getCorrectAnswer());
            question.setCorrectOptionId(questionDto.getCorrectOptionId());

            // Sync options
            if (questionDto.getOptions() != null) {
                java.util.Map<Long, Option> existingOptionsMap = new java.util.HashMap<>();
                if (question.getOptions() != null) {
                    for (Option opt : question.getOptions()) {
                        if (opt.getId() != null) {
                            existingOptionsMap.put(opt.getId(), opt);
                        }
                    }
                }

                List<Option> updatedOptions = new ArrayList<>();
                for (com.athena.lms.athena_lms.dto.OptionDto optDto : questionDto.getOptions()) {
                    Option option = null;
                    if (optDto.getId() != null && optDto.getId() > 0) {
                        option = existingOptionsMap.get(optDto.getId());
                    }

                    if (option == null) {
                        // New option
                        option = optionMapper.toEntity(optDto);
                        // Handle negative IDs
                        if (option.getId() != null && option.getId() < 0) {
                            option.setId(null);
                        }
                    } else {
                        // Update existing option
                        option.setOptionText(optDto.getOptionText());
                        option.setTempId(optDto.getTempId());
                    }

                    option.setQuestion(question);
                    option.setTest(test);
                    updatedOptions.add(option);
                }

                if (question.getOptions() == null) {
                    question.setOptions(new ArrayList<>());
                }
                question.getOptions().clear();
                question.getOptions().addAll(updatedOptions);
            }
        } else if (question.getQuestionType() == QuestionType.IDENTIFICATION
                || question.getQuestionType() == QuestionType.TRUE_FALSE) {
            question.setCorrectAnswer(questionDto.getCorrectAnswer());
        } else if (question.getQuestionType() == QuestionType.ESSAY) {
            // Essay logic if any
        }
        return question;
    }

    public void updateQuestion(QuestionDto questionDto) {
        Question question = questionMapper.toEntity(questionDto);
        questionRepository.save(question);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteQuestion(Long id) {
        // First delete all student answers associated with this question
        studentAnswerRepository.deleteByQuestionId(id);
        // Then delete the question
        questionRepository.deleteById(id);
    }

    public List<Section> getSections() {
        return sectionRepository.findAll();
    }

    public List<Subject> getSubjects() {
        return subjectRepository.findAll();
    }

    public List<TeacherAssignment> getTeacherAssignments(String username) {
        User user = userRepository.findByUsername(username);
        if (!(user instanceof Teacher)) {
            throw new AccessDeniedException("Current user is not a teacher");
        }
        return teacherAssignmentRepository.findByTeacher((Teacher) user);
    }
}
