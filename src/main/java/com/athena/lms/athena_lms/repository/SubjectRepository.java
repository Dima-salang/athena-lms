package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.athena.lms.athena_lms.model.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
