package com.athena.lms.athena_lms.service.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
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

import com.blazebit.persistence.CriteriaBuilderFactory;
import com.blazebit.persistence.PagedList;
import com.blazebit.persistence.CriteriaBuilder;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.PageImpl;

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
    private final CriteriaBuilderFactory cbf;
    private final EntityManager em;

    public AdminService(UserRepository userRepository, TestRepository testRepository,
            SectionRepository sectionRepository, SubjectRepository subjectRepository,
            OptionRepository optionRepository, SectionMapper sectionMapper, SubjectMapper subjectMapper,
            TeacherAssignmentRepository teacherAssignmentRepository,
            CriteriaBuilderFactory cbf, EntityManager em) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.optionRepository = optionRepository;
        this.sectionMapper = sectionMapper;
        this.subjectMapper = subjectMapper;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.cbf = cbf;
        this.em = em;
    }

    public Page<User> getUsers(String role, String search, Pageable pageable) {
        CriteriaBuilder<User> cb = cbf.create(em, User.class);

        if (role != null && !role.isEmpty() && !"ALL".equalsIgnoreCase(role)) {
            cb.where("role").eq(role);
        }

        if (search != null && !search.isEmpty()) {
            cb.whereOr()
                    .where("LOWER(firstName)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .where("LOWER(lastName)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .where("LOWER(username)").like(false).value("%" + search.toLowerCase() + "%").noEscape()
                    .endOr();
        }

        cb.orderByAsc("id"); // Default ordering

        PagedList<User> pagedList = cb.page(pageable.getPageNumber() * pageable.getPageSize(), pageable.getPageSize())
                .getResultList();

        return new PageImpl<>(pagedList, pageable, pagedList.getTotalSize());
    }

    public void createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new DuplicateNameException("Username already exists");
        }
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public Page<User> getTeachers(Pageable pageable) {
        return userRepository.findAllByRole("TEACHER", pageable);
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
    public Page<TeacherAssignment> getTeacherAssignments(Pageable pageable) {
        return teacherAssignmentRepository.findAll(pageable);
    }

    public TeacherAssignment createOrUpdateTeacherAssignment(TeacherAssignment teacherAssignment) {
        if (teacherAssignmentRepository.existsByTeacherIdAndSubjectIdAndSectionId(
                teacherAssignment.getTeacher().getId(), teacherAssignment.getSubject().getId(),
                teacherAssignment.getSection().getId())) {
            throw new DuplicateNameException("Teacher assignment already exists");
        }
        return teacherAssignmentRepository.save(teacherAssignment);
    }

    public void deleteTeacherAssignment(Long id) {
        teacherAssignmentRepository.deleteById(id);
    }

}
