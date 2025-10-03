package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.Teacher;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {}
