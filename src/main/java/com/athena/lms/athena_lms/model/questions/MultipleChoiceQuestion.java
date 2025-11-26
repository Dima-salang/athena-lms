package com.athena.lms.athena_lms.model.questions;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

import java.util.List;

import com.athena.lms.athena_lms.model.options.Option;

@Entity
public class MultipleChoiceQuestion extends Question {
    private String correctAnswer;
    private Long correctOptionId;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Option> options;

    // getters and setters
    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public Long getCorrectOptionId() {
        return correctOptionId;
    }

    public void setCorrectOptionId(Long correctOptionId) {
        this.correctOptionId = correctOptionId;
    }

    public List<Option> getOptions() {
        return options;
    }

    public void setOptions(List<Option> options) {
        this.options = options;
    }
}
