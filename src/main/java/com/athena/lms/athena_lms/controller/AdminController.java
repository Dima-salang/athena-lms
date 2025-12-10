package com.athena.lms.athena_lms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import com.athena.lms.athena_lms.service.admin.AdminService;
import com.athena.lms.athena_lms.service.auth.AuthService;
import com.athena.lms.athena_lms.model.Admin;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.TeacherAssignment;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.dto.SectionDto;
import com.athena.lms.athena_lms.dto.SubjectDto;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getUsers(role, search, pageable));
    }

    @GetMapping("/teachers")
    public ResponseEntity<Page<User>> getAllTeachers(Pageable pageable) {
        return ResponseEntity.ok(adminService.getTeachers(pageable));
    }

    @GetMapping("/tests")
    public ResponseEntity<List<Test>> getAllTests() {
        return ResponseEntity.ok(adminService.getTests());
    }

    @GetMapping("/options")
    public ResponseEntity<List<Option>> getAllOptions() {
        return ResponseEntity.ok(adminService.getOptions());
    }

    @GetMapping("/sections")
    public ResponseEntity<List<SectionDto>> getAllSections() {
        return ResponseEntity.ok(adminService.getSections());
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectDto>> getAllSubjects() {
        return ResponseEntity.ok(adminService.getSubjects());
    }

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@RequestBody User user) {
        adminService.createUser(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sections")
    public ResponseEntity<SectionDto> createOrUpdateSection(@RequestBody Section section,
            @RequestParam(required = false) Long teacherId) {
        return ResponseEntity.ok(adminService.createOrUpdateSection(section, teacherId));
    }

    @PostMapping("/subjects")
    public ResponseEntity<SubjectDto> createOrUpdateSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(adminService.createOrUpdateSubject(subject));
    }

    // create another admin account
    @PostMapping("/register/admin")
    public User createAdmin(@RequestBody Admin admin) {
        return authService.registerAdmin(admin);
    }

    // create a teacher assignment
    @PostMapping("register/teacher-assignment")
    public ResponseEntity<TeacherAssignment> createTeacherAssignment(@RequestBody TeacherAssignment teacherAssignment) {
        return ResponseEntity.ok(adminService.createOrUpdateTeacherAssignment(teacherAssignment));
    }

    @GetMapping("/teacher-assignments")
    public ResponseEntity<Page<TeacherAssignment>> getAllTeacherAssignments(Pageable pageable) {
        return ResponseEntity.ok(adminService.getTeacherAssignments(pageable));
    }

    @DeleteMapping("/teacher-assignments")
    public ResponseEntity<Void> deleteTeacherAssignment(@RequestParam Long id) {
        adminService.deleteTeacherAssignment(id);
        return ResponseEntity.ok().build();
    }

}
