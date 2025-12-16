package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<SubmissionDto> createOrUpdateSubmission(@RequestBody SubmissionDto submissionDto) {
        return ResponseEntity.ok(submissionService.createOrUpdateSubmission(submissionDto));
    }

    @DeleteMapping("/submit/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/submit/{testId}")
    public ResponseEntity<List<SubmissionDto>> getSubmissionsByTest(@PathVariable Long testId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(submissionService.getSubmissionsByTest(testId, search));
    }

    @PostMapping("/start/{testId}")
    public ResponseEntity<SubmissionDto> startTest(@PathVariable Long testId, java.security.Principal principal) {
        return ResponseEntity.ok(submissionService.startTest(testId, principal.getName()));
    }

    @PostMapping("/submit/update-answers")
    public ResponseEntity<List<StudentAnswerDto>> createOrUpdateStudentAnswers(
            @RequestBody List<StudentAnswerDto> studentAnswerDtos) {
        return ResponseEntity.ok(submissionService.createOrUpdateStudentAnswers(studentAnswerDtos));
    }

    @PostMapping("/{submissionId}/finalize")
    public ResponseEntity<SubmissionDto> submitTest(@PathVariable Long submissionId,
            @RequestBody List<StudentAnswerDto> studentAnswerDtos) {
        return ResponseEntity.ok(submissionService.submitTest(submissionId, studentAnswerDtos));
    }

    @GetMapping("/{submissionId}/answers")
    public ResponseEntity<List<StudentAnswerDto>> getStudentAnswers(@PathVariable Long submissionId) {
        return ResponseEntity.ok(submissionService.getStudentAnswers(submissionId));
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDto> getSubmission(@PathVariable Long submissionId) {
        return ResponseEntity.ok(submissionService.getSubmissionById(submissionId));
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<List<SubmissionDto>> getMySubmissions(java.security.Principal principal) {
        return ResponseEntity.ok(submissionService.getStudentSubmissions(principal.getName()));
    }
}
