package com.dto;

import java.util.List;

import java.time.Duration;
import java.time.LocalDateTime;

public class TestDto {
    private Long id;
    private String testName;
    private String testDescription;
    private LocalDateTime testIssueDate;
    private LocalDateTime testDueDate;
    private Duration testDuration;
    private SectionDto section;
    private SubjectDto subject;

    private Long sectionId;
    private Long subjectId;
    private Long teacherId;

    private List<QuestionDto> questions;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getTestDescription() {
        return testDescription;
    }

    public void setTestDescription(String testDescription) {
        this.testDescription = testDescription;
    }

    public LocalDateTime getTestIssueDate() {
        return testIssueDate;
    }

    public void setTestIssueDate(LocalDateTime testIssueDate) {
        this.testIssueDate = testIssueDate;
    }

    public LocalDateTime getTestDueDate() {
        return testDueDate;
    }

    public void setTestDueDate(LocalDateTime testDueDate) {
        this.testDueDate = testDueDate;
    }

    public Duration getTestDuration() {
        return testDuration;
    }

    public void setTestDuration(Duration testDuration) {
        this.testDuration = testDuration;
    }

    public SectionDto getSection() {
        return section;
    }

    public void setSection(SectionDto section) {
        this.section = section;
    }

    public SubjectDto getSubject() {
        return subject;
    }

    public void setSubject(SubjectDto subject) {
        this.subject = subject;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public List<QuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionDto> questions) {
        this.questions = questions;
    }

}
