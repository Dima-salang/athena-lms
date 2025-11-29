package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
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
    public ResponseEntity<List<TestDto>> getTestBySection(@PathVariable Long sectionId) {
        System.err.println("Section ID: " + sectionId);
        return ResponseEntity.ok(testManagementService.getTestsBySection(sectionId));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<TestDto>> getTestBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(testManagementService.getTestsBySubject(subjectId));
    }
}
