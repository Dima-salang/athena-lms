package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.athena.lms.athena_lms.service.tests.TestManagementService;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.model.questions.Question;

import java.security.Principal;

@RestController
@RequestMapping("/api/tests")
public class testController {
    private final TestManagementService testManagementService;

    public testController(TestManagementService testManagementService) {
        this.testManagementService = testManagementService;
    }

    @PostMapping
    public ResponseEntity<Test> createTest(@RequestBody Test test, Principal principal) {
        Test createdTest = testManagementService.createTest(test, principal.getName());
        return ResponseEntity.ok(createdTest);
    }

    @PostMapping("/questions")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question, @RequestParam Long testId) {
        return ResponseEntity.ok(testManagementService.createQuestion(question, testId));
    }

    @PostMapping("/questions/bulk")
    public ResponseEntity<List<Question>> bulkCreateQuestions(@RequestBody List<Question> questions,
            @RequestParam Long testId) {
        return ResponseEntity.ok(testManagementService.bulkCreateQuestions(questions, testId));
    }

    // get specific tests for the teacher
    @GetMapping("{teacherId}/tests")
    public ResponseEntity<List<Test>> getTeacherTests(@PathVariable Long teacherId) {
        try {
            return ResponseEntity.ok(testManagementService.getTeacherTests(teacherId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTestById(@PathVariable Long id) {
        Test test = testManagementService.getTestById(id);
        if (test != null) {
            return ResponseEntity.ok(test);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
