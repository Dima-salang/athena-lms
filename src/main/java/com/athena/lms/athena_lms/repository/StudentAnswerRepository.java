package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.submission.StudentAnswer;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    java.util.List<StudentAnswer> findBySubmissionId(Long submissionId);
}
