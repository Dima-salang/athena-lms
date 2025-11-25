package com.athena.lms.athena_lms.model.options;

import com.athena.lms.athena_lms.model.questions.Question;
import com.athena.lms.athena_lms.model.tests.Test;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
public class Option {
    private String optionText;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tempId; // for storing the temp id for autosaving

    // question it belongs to
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonBackReference
    private Question question;

    // test it belongs to
    @ManyToOne
    @JoinColumn(name = "test_id", nullable = false)
    @JsonBackReference
    private Test test;

    // getter and setter
    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public Test getTest() {
        return test;
    }

    public void setTest(Test test) {
        this.test = test;
    }

}
