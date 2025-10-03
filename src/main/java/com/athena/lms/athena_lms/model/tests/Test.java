package com.athena.lms.athena_lms.model.tests;

import jakarta.persistence.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.questions.Question;

@Entity
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255, nullable = false)
    private String TestName;

    @Column(length = 255)
    private String TestDescription;
    private LocalDateTime TestIssueDate;
    private LocalDateTime TestDueDate;
    private Duration TestDuration;

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;

    // map to teacher
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    // map to subject
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    // questions
    @OneToMany(mappedBy = "test")
    private List<Question> questions;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTestName() {
        return TestName;
    }

    public void setTestName(String testName) {
        TestName = testName;
    }

    public String getTestDescription() {
        return TestDescription;
    }

    public void setTestDescription(String testDescription) {
        TestDescription = testDescription;
    }

    public LocalDateTime getTestIssueDate() {
        return TestIssueDate;
    }

    public void setTestIssueDate(LocalDateTime testIssueDate) {
        TestIssueDate = testIssueDate;
    }

    public LocalDateTime getTestDueDate() {
        return TestDueDate;
    }

    public void setTestDueDate(LocalDateTime testDueDate) {
        TestDueDate = testDueDate;
    }

    public Duration getTestDuration() {
        return TestDuration;
    }

    public void setTestDuration(Duration testDuration) {
        TestDuration = testDuration;
    }

    public Section getSection() {
        return section;
    }

    public void setSection(Section section) {
        this.section = section;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }

    
}
