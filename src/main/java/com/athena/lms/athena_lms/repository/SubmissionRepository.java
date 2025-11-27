package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.athena.lms.athena_lms.model.submission.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

}
