package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.athena.lms.athena_lms.dto.QuestionDto;
import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.service.tests.TestManagementService;

import java.security.Principal;

@RestController
@RequestMapping("/api/teacher/tests")
public class TestController {
    private final TestManagementService testManagementService;

    public TestController(TestManagementService testManagementService) {
        this.testManagementService = testManagementService;
    }

    @PostMapping
    public ResponseEntity<TestDto> createTest(@RequestBody TestDto testDto, Principal principal) {
        TestDto createdTest = testManagementService.createTest(testDto, principal.getName());
        return ResponseEntity.ok(createdTest);
    }

    @PostMapping("/autosave")
    public ResponseEntity<List<QuestionDto>> autosaveQuestions(@RequestBody List<QuestionDto> questions,
            @RequestParam Long testId) {
        return ResponseEntity.ok(testManagementService.createOrUpdateQuestions(questions, testId));
    }

    @PostMapping("/autosave/{testId}")
    public ResponseEntity<TestDto> autosaveTest(@RequestBody TestDto testDto, @PathVariable Long testId) {
        return ResponseEntity.ok(testManagementService.autosaveTest(testId, testDto));
    }

    // delete questions
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        testManagementService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    // update test
    @PatchMapping("/{id}") // Changed mapping from /tests/{id} to /{id}
    public ResponseEntity<TestDto> updateTest(@PathVariable Long id, @RequestBody TestDto testDto) {
        TestDto updatedTest = testManagementService.updateTest(id, testDto);
        return ResponseEntity.ok(updatedTest);
    }

    @PostMapping("/questions")
    public ResponseEntity<List<QuestionDto>> createQuestions(@RequestBody List<QuestionDto> questions,
            @RequestParam Long testId) { // Removed @RequestParam List<Option> options
        return ResponseEntity.ok(testManagementService.createQuestions(questions, testId));
    }

    // get specific tests for the teacher
    @GetMapping("{teacherId}/tests")
    public ResponseEntity<org.springframework.data.domain.Page<TestDto>> getTeacherTests(
            @PathVariable Long teacherId,
            Pageable pageable) {
        try {
            return ResponseEntity.ok(testManagementService.getTeacherTests(teacherId, pageable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestDto> getTestById(@PathVariable Long id) {
        TestDto test = testManagementService.getTestById(id);
        if (test != null) {
            return ResponseEntity.ok(test);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/sections")
    public ResponseEntity<List<Section>> getSections() {
        return ResponseEntity.ok(testManagementService.getSections());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects() {
        return ResponseEntity.ok(testManagementService.getSubjects());
    }

}
