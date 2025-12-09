package com.athena.lms.athena_lms.service.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.exceptions.DuplicateNameException;
import com.athena.lms.athena_lms.dto.SectionDto;
import com.athena.lms.athena_lms.dto.SubjectDto;
import com.athena.lms.athena_lms.mapper.SectionMapper;
import com.athena.lms.athena_lms.mapper.SubjectMapper;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.TeacherAssignment;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.repository.OptionRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.TeacherAssignmentRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final OptionRepository optionRepository;
    private final SectionMapper sectionMapper;
    private final SubjectMapper subjectMapper;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public AdminService(UserRepository userRepository, TestRepository testRepository,
            SectionRepository sectionRepository, SubjectRepository subjectRepository,
            OptionRepository optionRepository, SectionMapper sectionMapper, SubjectMapper subjectMapper,
            TeacherAssignmentRepository teacherAssignmentRepository) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.optionRepository = optionRepository;
        this.sectionMapper = sectionMapper;
        this.subjectMapper = subjectMapper;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    // TODO: make sure to include filters
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public void createUser(User user) {
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<Teacher> getTeachers() {
        List<User> teachers = userRepository.findAllByRole("TEACHER");
        return teachers.stream()
                .map(user -> (Teacher) user)
                .collect(Collectors.toList());
    }

    // TESTS

    public List<Test> getTests() {
        return testRepository.findAll();
    }

    public List<Option> getOptions() {
        return optionRepository.findAll();
    }

    // SECTIONS

    public List<SectionDto> getSections() {
        List<Section> sections = sectionRepository.findAll();
        List<SectionDto> sectionDtos = new ArrayList<>();
        for (Section section : sections) {
            sectionDtos.add(sectionMapper.toDto(section));
        }
        return sectionDtos;
    }

    public SectionDto createOrUpdateSection(Section section, Long teacherId) {
        if (sectionRepository.existsByName(section.getName())) {
            throw new DuplicateNameException("Section name already exists");
        }
        if (teacherId != null) {
            section.setAdviser((Teacher) userRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found")));
        }
        Section savedSection = sectionRepository.save(section);
        return sectionMapper.toDto(savedSection);
    }

    public void deleteSection(Long id) {
        sectionRepository.deleteById(id);
    }

    // SUBJECTS

    public List<SubjectDto> getSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        List<SubjectDto> subjectDtos = new ArrayList<>();
        for (Subject subject : subjects) {
            subjectDtos.add(subjectMapper.toDto(subject));
        }
        return subjectDtos;
    }

    public SubjectDto createOrUpdateSubject(Subject subject) {
        if (subjectRepository.existsByName(subject.getName())) {
            throw new DuplicateNameException("Subject name already exists");
        }
        Subject savedSubject = subjectRepository.save(subject);
        return subjectMapper.toDto(savedSubject);
    }

    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }


    // Teacher Assignment
    public List<TeacherAssignment> getTeacherAssignments() {
        return teacherAssignmentRepository.findAll();
    }

    public TeacherAssignment createOrUpdateTeacherAssignment(TeacherAssignment teacherAssignment) {
        return teacherAssignmentRepository.save(teacherAssignment);
    }

    public void deleteTeacherAssignment(Long id) {
        teacherAssignmentRepository.deleteById(id);
    }

}
