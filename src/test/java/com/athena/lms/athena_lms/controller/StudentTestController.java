package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public List<TestDto> getTestBySection(@PathVariable Long sectionId) {
        return testManagementService.getTestsBySection(sectionId);
    }

    @GetMapping("/subject/{subjectId}")
    public List<TestDto> getTestBySubject(@PathVariable Long subjectId) {
        return testManagementService.getTestsBySubject(subjectId);
    }
}
