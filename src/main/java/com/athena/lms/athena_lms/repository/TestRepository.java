package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

import com.athena.lms.athena_lms.model.tests.Test;

public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByTeacherId(Long teacherId);

    Page<Test> findByTeacherId(Long teacherId,
            Pageable pageable);

    List<Test> findBySectionId(Long sectionId);

    List<Test> findBySubjectId(Long subjectId);
}
