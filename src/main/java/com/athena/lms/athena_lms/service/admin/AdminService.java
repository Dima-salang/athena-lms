package com.athena.lms.athena_lms.service.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import com.athena.lms.athena_lms.model.options.Option;
import com.athena.lms.athena_lms.model.tests.Test;
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

    public AdminService(UserRepository userRepository, TestRepository testRepository,
            SectionRepository sectionRepository, SubjectRepository subjectRepository,
            OptionRepository optionRepository) {
        this.userRepository = userRepository;
        this.testRepository = testRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.optionRepository = optionRepository;
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

    public List<Section> getSections() {
        return sectionRepository.findAll();
    }


    public void createOrUpdateSection(Section section) {
        sectionRepository.save(section);
    }

    public void deleteSection(Long id) {
        sectionRepository.deleteById(id);
    }

    // SUBJECTS

    public List<Subject> getSubjects() {
        return subjectRepository.findAll();
    }

    public void createOrUpdateSubject(Subject subject) {
        subjectRepository.save(subject);
    }

    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }



    

}
