package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import com.athena.lms.athena_lms.service.tests.SubmissionService;
import com.athena.lms.athena_lms.dto.StudentAnswerDto;
import com.athena.lms.athena_lms.dto.SubmissionDto;

@RestController
@RequestMapping("/api/student/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping("/submit")
    public SubmissionDto createOrUpdateSubmission(@RequestBody SubmissionDto submissionDto) {
        return submissionService.createOrUpdateSubmission(submissionDto);
    }

    @DeleteMapping("/submit/{id}")
    public void deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
    }

    @GetMapping("/submit/{testId}")
    public List<SubmissionDto> getSubmissionsByTest(@PathVariable Long testId) {
        return submissionService.getSubmissionsByTest(testId);
    }

    @PostMapping("/submit/update-answers")
    public List<StudentAnswerDto> createOrUpdateStudentAnswers(@RequestBody List<StudentAnswerDto> studentAnswerDtos) {
        return submissionService.createOrUpdateStudentAnswers(studentAnswerDtos);
    }

}
