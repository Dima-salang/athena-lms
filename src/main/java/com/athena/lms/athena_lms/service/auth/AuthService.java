package com.athena.lms.athena_lms.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Student;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.UserRepository;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SectionRepository sectionRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            SectionRepository sectionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sectionRepository = sectionRepository;
    }

    public User registerStudent(Student student) {
        student.setRole("STUDENT");

        if (student.getSection() != null) {
            String sectionName = student.getSection().getName();
            if (sectionName != null && !sectionName.isEmpty()) {
                Section existingSection = sectionRepository.findByName(sectionName);
                if (existingSection != null) {
                    student.setSection(existingSection);
                } else {
                    Section newSection = new Section();
                    newSection.setName(sectionName);
                    student.setSection(sectionRepository.save(newSection));
                }
            }
        }

        encodePassword(student);
        return userRepository.save(student);
    }

    public User registerTeacher(Teacher teacher) {
        teacher.setRole("TEACHER");
        encodePassword(teacher);
        return userRepository.save(teacher);
    }

    private void encodePassword(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    }
}
