package com.athena.lms.athena_lms.model.tests;

import jakarta.persistence.*;

import java.time.Duration;
import java.time.Instant;
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
    private Instant TestIssueDate;
    private Instant TestDueDate;
    private Duration TestDuration;
    private boolean hasInfiniteTime;
    private Instant createdAt;
    private Instant updatedAt;

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
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true)
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

    public Instant getTestIssueDate() {
        return TestIssueDate;
    }

    public void setTestIssueDate(Instant testIssueDate) {
        TestIssueDate = testIssueDate;
    }

    public Instant getTestDueDate() {
        return TestDueDate;
    }

    public void setTestDueDate(Instant testDueDate) {
        TestDueDate = testDueDate;
    }

    public Duration getTestDuration() {
        return TestDuration;
    }

    public void setTestDuration(Duration testDuration) {
        TestDuration = testDuration;
    }

    public boolean isHasInfiniteTime() {
        return hasInfiniteTime;
    }

    public void setHasInfiniteTime(boolean hasInfiniteTime) {
        this.hasInfiniteTime = hasInfiniteTime;
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
    
    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

}
