package com.athena.lms.athena_lms.service.tests;

import java.util.List;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.repository.QuestionRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;

@Service
public class TestManagementService {
    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;

    public TestManagementService(UserRepository userRepository, TestRepository testRepository, QuestionRepository questionRepository) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
    }

    public void createTest(Test test) {
        testRepository.save(test);
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

    public void createQuestion(Question question) {
        questionRepository.save(question);
    }

    public void bulkCreateQuestions(List<Question> questions) {
        questionRepository.saveAll(questions);
    }

    public void updateQuestion(Question question) {
        questionRepository.save(question);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }
}
