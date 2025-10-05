package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.athena.lms.athena_lms.service.auth.AuthService;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        String token = authService.login(user.getUsername(), user.getPassword());
        if (token != null) {
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<User> registerStudent(@RequestBody Student student) {
        try {
            return ResponseEntity.ok(authService.registerStudent(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/register/teacher")
    public ResponseEntity<User> registerTeacher(@RequestBody Teacher teacher) {
        try {
            return ResponseEntity.ok(authService.registerTeacher(teacher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
}
