package com.athena.lms.athena_lms.model.questions;

import jakarta.persistence.Entity;
import java.util.List;

@Entity
public class MultipleChoiceQuestion extends Question {
    private List<String> options;
    private String questionAnswer;
    private String correctAnswer;
    // getters and setters
    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getQuestionAnswer() {
        return questionAnswer;
    }

    public void setQuestionAnswer(String questionAnswer) {
        this.questionAnswer = questionAnswer;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
}
