package com.athena.lms.athena_lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.submission.StudentAnswer;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    List<StudentAnswer> findBySubmissionId(Long submissionId);

    void deleteByQuestionId(Long questionId);

    // find by submission id and submissions that are submitted
    List<StudentAnswer> findBySubmissionIdAndSubmissionSubmittedAtIsNotNull(Long submissionId);

    StudentAnswer findBySubmissionIdAndQuestionId(Long submissionId, Long questionId);



}
