package com.athena.lms.athena_lms.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.athena.lms.athena_lms.model.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import jakarta.transaction.Transactional;
import com.athena.lms.athena_lms.repository.*;
import com.athena.lms.athena_lms.service.admin.AdminService;
import com.athena.exceptions.*;
import org.junit.jupiter.api.Assertions;

@SpringBootTest(properties = { "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.jpa.hibernate.ddl-auto=create-drop" })
@AutoConfigureMockMvc
@Transactional
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AdminService adminService;

    @BeforeEach
    public void setUp() {
        // set up users
        Student student = new Student();
        student.setUsername("student_user");
        student.setPassword("password");
        student.setFirstName("Student");
        student.setLastName("User");
        student.setLrn(654321);
        student.setRole("STUDENT");
        userRepository.save(student);

        Teacher teacher = new Teacher();
        teacher.setUsername("teacher_user");
        teacher.setPassword("password");
        teacher.setFirstName("Teacher");
        teacher.setLastName("User");
        teacher.setRole("TEACHER");
        userRepository.save(teacher);

        Admin admin = new Admin();
        admin.setUsername("admin_user");
        admin.setPassword("password");
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole("ADMIN");
        userRepository.save(admin);

        // set up sections
        Section section = new Section();
        section.setName("Section A");
        sectionRepository.save(section);

        // set up subjects
        Subject subject = new Subject();
        subject.setName("Subject A");
        subjectRepository.save(subject);
    }

    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testGetAllUsers() throws Exception {
        // use the filtering to get all users
        // params are role, search, and pageable

        mockMvc.perform(get("/api/admin/users")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(4)); // 4 due to automatic initial admin creation at
                                                                     // startup
    }

    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testGetAllSections() throws Exception {
        mockMvc.perform(get("/api/admin/sections"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testGetAllSubjects() throws Exception {
        mockMvc.perform(get("/api/admin/subjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // create section
    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testCreateSection() throws Exception {
        Section section = new Section();
        section.setName("Section C");
        mockMvc.perform(post("/api/admin/sections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(section))
                .with(csrf()))
                .andExpect(status().isOk());
    }

    // create subject
    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testCreateSubject() throws Exception {
        Subject subject = new Subject();
        subject.setName("Subject C");
        mockMvc.perform(post("/api/admin/subjects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(subject))
                .with(csrf()))
                .andExpect(status().isOk());
    }

    // create section with duplicate name
    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testCreateSectionWithDuplicateName() throws Exception {
        Section section = new Section();
        section.setName("Section A");
        mockMvc.perform(post("/api/admin/sections")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(section))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // expect a data integrity violation
    }

    // create subject with duplicate name
    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testCreateSubjectWithDuplicateName() throws Exception {
        Subject subject = new Subject();
        subject.setName("Subject A");
        mockMvc.perform(post("/api/admin/subjects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(subject))
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    // create user
    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testCreateUser() throws Exception {
        User user = new User();
        user.setUsername("user_user");
        user.setPassword("password");
        user.setFirstName("User");
        user.setLastName("User");
        user.setRole("USER");
        mockMvc.perform(post("/api/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user))
                .with(csrf()))
                .andExpect(status().isOk());
    }

    // create user with duplicate username
    @Test
    @WithMockUser(username = "admin_user", roles = "ADMIN")
    public void testCreateUserWithDuplicateUsername() throws Exception {
        User user = new User();
        user.setUsername("admin_user");
        user.setPassword("password");
        user.setFirstName("User");
        user.setLastName("User");
        user.setRole("USER");
        mockMvc.perform(post("/api/admin/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user))
                .with(csrf()))
                .andExpect(status().isBadRequest());

        // expect throws a DuplicateNameException
        Assertions.assertThrows(DuplicateNameException.class, () -> {
            adminService.createUser(user);
        });
    }

}
