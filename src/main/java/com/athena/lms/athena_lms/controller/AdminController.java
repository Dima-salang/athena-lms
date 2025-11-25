package com.athena.lms.athena_lms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.athena.lms.athena_lms.service.admin.AdminService;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.dto.SectionDto;
import com.athena.lms.athena_lms.dto.SubjectDto;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getUsers();
    }

    @GetMapping("/tests")
    public List<Test> getAllTests() {
        return adminService.getTests();
    }

    @GetMapping("/options")
    public List<Option> getAllOptions() {
        return adminService.getOptions();
    }

    @GetMapping("/sections")
    public List<SectionDto> getAllSections() {
        return adminService.getSections();
    }

    @GetMapping("/subjects")
    public List<SubjectDto> getAllSubjects() {
        return adminService.getSubjects();
    }

    @PostMapping("/users")
    public void createUser(@RequestBody User user) {
        adminService.createUser(user);
    }

    @PostMapping("/sections")
    public void createOrUpdateSection(@RequestBody Section section) {
        adminService.createOrUpdateSection(section);
    }

    @PostMapping("/subjects")
    public void createOrUpdateSubject(@RequestBody Subject subject) {
        adminService.createOrUpdateSubject(subject);
    }

}
