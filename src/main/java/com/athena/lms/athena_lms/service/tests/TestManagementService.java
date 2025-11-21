package com.athena.lms.athena_lms.service.tests;

import java.util.List;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.repository.QuestionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;

@Service
public class TestManagementService {
    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;

    public TestManagementService(UserRepository userRepository, TestRepository testRepository,
            QuestionRepository questionRepository,
            SubjectRepository subjectRepository,
            SectionRepository sectionRepository) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
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
            }
        }

        return testRepository.save(test);
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

    public Question createQuestion(Question question, Long testId) {
        // save the question on the test list
        Test test = testRepository.findById(testId).orElse(null);
        if (test == null) {
            throw new RuntimeException("Test not found");
        }
        question.setTest(test);
        test.getQuestions().add(question);
        testRepository.save(test);
        return question;
    }

    public List<Question> bulkCreateQuestions(List<Question> questions, Long testId) {
        // save the questions on the test list
        Test test = testRepository.findById(testId).orElse(null);
        if (test == null) {
            throw new RuntimeException("Test not found");
        }
        for (Question question : questions) {
            question.setTest(test);
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
