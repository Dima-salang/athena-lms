package com.dto;

import java.util.List;

public class MultipleChoiceQuestionDto extends QuestionDto {
    private String correctAnswer;
    private List<OptionDto> options;

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }
}
