package com.athena.lms.athena_lms.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.repository.UserRepository;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;
    
    public AuthService(UserRepository userRepository, JWTService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public String login(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return jwtService.generateToken(user);
        }
        return null;
    }

    public User registerStudent(Student student) {
        encodePassword(student);
        return userRepository.save(student);
    }

    public User registerTeacher(Teacher teacher) {
        encodePassword(teacher);
        return userRepository.save(teacher);
    }

    private void encodePassword(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    }
}
