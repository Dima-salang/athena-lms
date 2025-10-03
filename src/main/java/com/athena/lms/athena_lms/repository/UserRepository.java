package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
}
