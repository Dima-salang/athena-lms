package com.athena.lms.athena_lms.model.questions;

import jakarta.persistence.Entity;

@Entity
public class TrueFalseQuestion extends Question {
    private String trueFalseAnswer;
    
    // getters and setters
    public String getTrueFalseAnswer() {
        return trueFalseAnswer;
    }

    public void setTrueFalseAnswer(String trueFalseAnswer) {
        this.trueFalseAnswer = trueFalseAnswer;
    }
}
