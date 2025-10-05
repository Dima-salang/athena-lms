package com.athena.lms.athena_lms.controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.athena.lms.athena_lms.service.tests.TestManagementService;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.model.questions.Question;


@RestController
@RequestMapping("/api/tests")
public class testController {
    private final TestManagementService testManagementService;
    
    public testController(TestManagementService testManagementService) {
        this.testManagementService = testManagementService;
    }

    @PostMapping
    public void createTest(@RequestBody Test test) {
        testManagementService.createTest(test);
    }

    @PostMapping("/questions")
    public void createQuestion(@RequestBody Question question) {
        testManagementService.createQuestion(question);
    }

    @PostMapping("/questions/bulk")
    public void bulkCreateQuestions(@RequestBody List<Question> questions) {
        testManagementService.bulkCreateQuestions(questions);
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
}
