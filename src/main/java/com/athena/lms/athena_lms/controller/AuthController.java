package com.athena.lms.athena_lms.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.athena.lms.athena_lms.service.SectionService;
import com.athena.lms.athena_lms.service.auth.AuthService;
import com.athena.lms.athena_lms.model.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final SectionService sectionService;

    public AuthController(AuthService authService, SectionService sectionService) {
        this.authService = authService;
        this.sectionService = sectionService;
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

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            // return null user
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(authService.getUserByUsername(principal.getName()));
    }

    @GetMapping("/register/sections")
    public ResponseEntity<List<Section>> getSections() {
        return ResponseEntity.ok(sectionService.getAllSections());
    }

}
