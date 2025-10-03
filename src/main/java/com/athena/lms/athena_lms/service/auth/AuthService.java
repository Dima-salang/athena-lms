package com.athena.lms.athena_lms.service.auth;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.repository.UserRepository;

// bcrypt password encoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {
    private final UserRepository userRepository;
    
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String username, String password) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
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
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
    }
}
