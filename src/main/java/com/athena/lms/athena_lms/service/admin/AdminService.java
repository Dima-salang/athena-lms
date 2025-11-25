package com.athena.lms.athena_lms.service.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.tests.Test;
import com.athena.lms.athena_lms.dto.SectionDto;
import com.athena.lms.athena_lms.dto.SubjectDto;
import com.athena.lms.athena_lms.mapper.SectionMapper;
import com.athena.lms.athena_lms.mapper.SubjectMapper;
import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.User;
import com.athena.lms.athena_lms.repository.OptionRepository;
import com.athena.lms.athena_lms.repository.SectionRepository;
import com.athena.lms.athena_lms.repository.SubjectRepository;
import com.athena.lms.athena_lms.repository.TestRepository;
import com.athena.lms.athena_lms.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TestRepository testRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final OptionRepository optionRepository;
    private final SectionMapper sectionMapper;
    private final SubjectMapper subjectMapper;

    public AdminService(UserRepository userRepository, TestRepository testRepository,
            SectionRepository sectionRepository, SubjectRepository subjectRepository,
            OptionRepository optionRepository, SectionMapper sectionMapper, SubjectMapper subjectMapper) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.optionRepository = optionRepository;
        this.sectionMapper = sectionMapper;
        this.subjectMapper = subjectMapper;
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

    public void createOrUpdateSection(Section section) {
        sectionRepository.save(section);
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

    public void createOrUpdateSubject(Subject subject) {
        subjectRepository.save(subject);
    }

    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }

}
