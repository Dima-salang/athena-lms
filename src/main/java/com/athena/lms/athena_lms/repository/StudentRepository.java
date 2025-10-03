package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
    
    
}
