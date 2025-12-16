package com.athena.lms.athena_lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.submission.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByTestId(Long testId);

    Submission findFirstByTestIdAndStudentIdAndEndTimeIsNull(Long testId, Long studentId);

    Submission findFirstByTestIdAndStudentIdAndSubmittedAtIsNull(Long testId, Long studentId);

    Submission findFirstByTestIdAndStudentIdAndSubmittedAtIsNotNull(Long testId, Long studentId);

    boolean existsByTestIdAndStudentIdAndSubmittedAtIsNotNull(Long testId, Long studentId);

    List<Submission> findByStudentId(Long studentId);
}
