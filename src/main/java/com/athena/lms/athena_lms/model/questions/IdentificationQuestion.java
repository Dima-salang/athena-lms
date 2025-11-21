package com.athena.lms.athena_lms.model.questions;

import jakarta.persistence.Entity;

@Entity
public class IdentificationQuestion extends Question {
    private String questionText;
    private String correctAnswer;


    // getters and setters
    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
}
