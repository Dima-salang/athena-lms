package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.athena.lms.athena_lms.service.auth.AuthService;
import com.athena.lms.athena_lms.model.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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

    @PostMapping("/register/admin")
    public ResponseEntity<User> registerAdmin(@RequestBody Admin admin) {
        try {
            return ResponseEntity.ok(authService.registerAdmin(admin));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        // We need to fetch the user from the repository to get full details including
        // section
        // Assuming authService has a method or we inject repository here.
        // For simplicity, let's inject UserRepository into AuthController or add a
        // method to AuthService.
        // Let's use AuthService.
        return ResponseEntity.ok(authService.getUserByUsername(principal.getName()));
    }

}
