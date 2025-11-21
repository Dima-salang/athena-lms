package com.athena.lms.athena_lms.service.tests;

import java.util.List;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.questions.MultipleChoiceQuestion;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.questions.QuestionType;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.repository.QuestionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;
import com.athena.lms.athena_lms.repository.OptionRepository;

@Service
public class TestManagementService {
    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final OptionRepository optionRepository;

    public TestManagementService(UserRepository userRepository, TestRepository testRepository,
            QuestionRepository questionRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository,
            OptionRepository optionRepository) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.optionRepository = optionRepository;
    }

    public Test createTest(Test test, String username) {
        // Handle Teacher
        User user = userRepository.findByUsername(username);
        if (user == null || !(user instanceof Teacher)) {
            throw new RuntimeException("Current user is not a teacher");
        }
        test.setTeacher((Teacher) user);

        // Handle Subject
        if (test.getSubject() != null) {
            String subjectName = test.getSubject().getName();
            if (subjectName != null && !subjectName.isEmpty()) {
                Subject existingSubject = subjectRepository.findByName(subjectName);
                if (existingSubject != null) {
                    test.setSubject(existingSubject);
                } else {
                    Subject newSubject = new Subject();
                    newSubject.setName(subjectName);
                    newSubject.setDescription(test.getSubject().getDescription());
                    test.setSubject(subjectRepository.save(newSubject));
                }
            }
        }

        // Handle Section
        if (test.getSection() != null) {
            String sectionName = test.getSection().getName();
            if (sectionName != null && !sectionName.isEmpty()) {
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

        List<Question> questions = test.getQuestions();
        // Handle Questions (Bidirectional relationship)
        if (questions != null) {
            for (Question question : questions) {
                question.setTest(test);
                if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                    MultipleChoiceQuestion multipleChoiceQuestion = (MultipleChoiceQuestion) question;
                    List<Option> options = multipleChoiceQuestion.getOptions();
                    for (Option option : options) {
                        option.setQuestion(question);
                        option.setTest(test);
                    }
                    optionRepository.saveAll(options);
                }
            }
        }

        return testRepository.save(test);
    }


    // update test

    // TO-DO: update test
    public Test updateTest(Long id, Test test) {
        Test existingTest = testRepository.findById(id).orElseThrow(null);
        if (existingTest == null) {
            throw new RuntimeException("Test not found");
        }


        existingTest.setSubject(test.getSubject());
        existingTest.setSection(test.getSection());
        existingTest.setQuestions(test.getQuestions());
        return testRepository.save(existingTest);
    }

    public Test getTestById(Long id) {
        return testRepository.findById(id).orElse(null);
    }

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    public List<Test> getTeacherTests(Long teacherId) {
        // validate the id
        User user = userRepository.findById(teacherId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return testRepository.findByTeacherId(teacherId);
    }

    public void deleteTest(Long id) {
        testRepository.deleteById(id);
    }

    public void updateTest(Test test) {
        testRepository.save(test);
    }

    public List<Question> createQuestions(List<Question> questions, Long testId, List<Option> options) {
        // save the questions on the test list
        Test test = testRepository.findById(testId).orElse(null);
        if (test == null) {
            throw new RuntimeException("Test not found");
        }
        for (Question question : questions) {
            question.setTest(test);

            // set the question and test for each option
            for (Option option : options) {
                option.setQuestion(question);
                option.setTest(test);
            }
            // save the options
            optionRepository.saveAll(options);

        }
        test.getQuestions().addAll(questions);
        testRepository.save(test);
        return questions;
    }

    public void updateQuestion(Question question) {
        questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}
