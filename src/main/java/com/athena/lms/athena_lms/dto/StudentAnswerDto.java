
package com.athena.lms.athena_lms.dto;

public class StudentAnswerDto {
    private Long id;
    private SubmissionDto submission;
    private QuestionDto question;
    private String textAnswer;
    private Long optionId;
    private Double points; // something assigned by the teacher
    private boolean isDirty;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SubmissionDto getSubmission() {
        return submission;
    }

    public void setSubmission(SubmissionDto submission) {
        this.submission = submission;
    }

    public QuestionDto getQuestion() {
        return question;
    }

    public void setQuestion(QuestionDto question) {
        this.question = question;
    }

    public String getTextAnswer() {
        return textAnswer;
    }

    public void setTextAnswer(String textAnswer) {
        this.textAnswer = textAnswer;
    }

    public Long getOptionId() {
        return optionId;
    }

    public void setOptionId(Long optionId) {
        this.optionId = optionId;
    }

    public Double getPoints() {
        return points;
    }

    public void setPoints(Double points) {
        this.points = points;
    }

    public boolean isDirty() {
        return isDirty;
    }

    public void setDirty(boolean dirty) {
        isDirty = dirty;
    }
}