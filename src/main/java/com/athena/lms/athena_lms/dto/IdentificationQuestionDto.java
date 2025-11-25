package com.athena.lms.athena_lms.dto;

public class IdentificationQuestionDto extends QuestionDto {
    private String correctAnswer;

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
}
