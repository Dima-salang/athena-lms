package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.service.tests.TestManagementService;

@RestController
@RequestMapping("/api/student/tests")
public class StudentTestController {
    private final TestManagementService testManagementService;

    public StudentTestController(TestManagementService testManagementService) {
        this.testManagementService = testManagementService;
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<Page<TestDto>> getTestBySection(@PathVariable Long sectionId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(testManagementService.getTestsBySection(sectionId, pageable, search));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TestDto>> getTestBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(testManagementService.getTestsBySubject(subjectId));
    }

    @GetMapping("/{testId}")
    public ResponseEntity<TestDto> getTestById(@PathVariable Long testId) {
        return ResponseEntity.ok(testManagementService.getTestById(testId));
    }
}
