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

    @PostMapping("/start/{testId}")
    public SubmissionDto startTest(@PathVariable Long testId, java.security.Principal principal) {
        return submissionService.startTest(testId, principal.getName());
    }

    @PostMapping("/submit/update-answers")
    public List<StudentAnswerDto> createOrUpdateStudentAnswers(@RequestBody List<StudentAnswerDto> studentAnswerDtos) {
        return submissionService.createOrUpdateStudentAnswers(studentAnswerDtos);
    }

    @PostMapping("/{submissionId}/finalize")
    public SubmissionDto submitTest(@PathVariable Long submissionId,
            @RequestBody List<StudentAnswerDto> studentAnswerDtos) {
        return submissionService.submitTest(submissionId, studentAnswerDtos);
    }

    @GetMapping("/{submissionId}/answers")
    public List<StudentAnswerDto> getStudentAnswers(@PathVariable Long submissionId) {
        return submissionService.getStudentAnswers(submissionId);
    }

}
