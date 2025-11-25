package com.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "questionType", visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = MultipleChoiceQuestionDto.class, name = "MULTIPLE_CHOICE"),
        @JsonSubTypes.Type(value = TrueFalseQuestionDto.class, name = "TRUE_FALSE"),
        @JsonSubTypes.Type(value = IdentificationQuestionDto.class, name = "IDENTIFICATION"),
        @JsonSubTypes.Type(value = EssayQuestionDto.class, name = "ESSAY")
})
public class QuestionDto {
    private Long id;
    private Long tempId;
    private String questionNumber;
    private String questionText;
    private String questionType;
    private List<OptionDto> options;
    private Long testId;
    private double fullPoints;
    private double correctPoints;

    // getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTempId() {
        return tempId;
    }

    public void setTempId(Long tempId) {
        this.tempId = tempId;
    }

    public String getQuestionNumber() {
        return questionNumber;
    }

    public void setQuestionNumber(String questionNumber) {
        this.questionNumber = questionNumber;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public List<OptionDto> getOptions() {
        return options;
    }

    public void setOptions(List<OptionDto> options) {
        this.options = options;
    }

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public double getFullPoints() {
        return fullPoints;
    }

    public void setFullPoints(double fullPoints) {
        this.fullPoints = fullPoints;
    }

    public double getCorrectPoints() {
        return correctPoints;
    }

    public void setCorrectPoints(double correctPoints) {
        this.correctPoints = correctPoints;
    }
}
