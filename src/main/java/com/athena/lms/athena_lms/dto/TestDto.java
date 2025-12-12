package com.athena.lms.athena_lms.dto;

import java.util.List;

import java.time.Instant;

public class TestDto {
    private Long id;
    private String testName;
    private String testDescription;
    private Instant testIssueDate;
    private Instant testDueDate;
    private Long testDuration;
    private boolean hasInfiniteTime;
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

    public Instant getTestIssueDate() {
        return testIssueDate;
    }

    public void setTestIssueDate(Instant testIssueDate) {
        this.testIssueDate = testIssueDate;
    }

    public Instant getTestDueDate() {
        return testDueDate;
    }

    public void setTestDueDate(Instant testDueDate) {
        this.testDueDate = testDueDate;
    }

    public Long getTestDuration() {
        return testDuration;
    }

    public void setTestDuration(Long testDuration) {
        this.testDuration = testDuration;
    }

    public boolean isHasInfiniteTime() {
        return hasInfiniteTime;
    }

    public void setHasInfiniteTime(boolean hasInfiniteTime) {
        this.hasInfiniteTime = hasInfiniteTime;
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

    private Instant createdAt;
    private Instant updatedAt;

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
