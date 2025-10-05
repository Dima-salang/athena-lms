package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.athena.lms.athena_lms.model.tests.Test;

public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByTeacherId(Long teacherId);
}
