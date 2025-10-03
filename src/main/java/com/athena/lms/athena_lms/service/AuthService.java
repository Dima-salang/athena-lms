package com.athena.lms.athena_lms.service;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.repository.UserRepository;

@Service
public class AuthService {
    private final UserRepository userRepository;
    
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        return userRepository.save(user);
    }

    public User registerTeacher(User user) {
        return userRepository.save(user); 
    }

        


}
