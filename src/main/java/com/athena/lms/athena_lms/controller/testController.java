package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.athena.lms.athena_lms.service.tests.TestManagementService;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.options.Option;
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


    // update test
    @PatchMapping("/tests/{id}")
    public ResponseEntity<Test> updateTest(@PathVariable Long id, @RequestBody Test test) {
        Test updatedTest = testManagementService.updateTest(id, test);
        return ResponseEntity.ok(updatedTest);
    }


    @PostMapping("/questions")
    public ResponseEntity<List<Question>> createQuestions(@RequestBody List<Question> questions,
            @RequestParam Long testId,
            @RequestParam List<Option> options) {
        return ResponseEntity.ok(testManagementService.createQuestions(questions, testId, options));
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
