package com.athena.lms.athena_lms.model.questions;

import jakarta.persistence.Entity;

@Entity
public class EssayQuestion extends Question {
    private String questionAnswer;
    private int points;

    // getters and setters
    public String getQuestionAnswer() {
        return questionAnswer;
    }

    public void setQuestionAnswer(String questionAnswer) {
        this.questionAnswer = questionAnswer;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
    
}
