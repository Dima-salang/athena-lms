package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.*;
import com.athena.lms.athena_lms.model.questions.*;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.SubclassMapping;

@Mapper(componentModel = "spring", uses = { OptionMapper.class })
public interface QuestionMapper {

    @SubclassMapping(source = MultipleChoiceQuestion.class, target = MultipleChoiceQuestionDto.class)
    @SubclassMapping(source = TrueFalseQuestion.class, target = TrueFalseQuestionDto.class)
    @SubclassMapping(source = IdentificationQuestion.class, target = IdentificationQuestionDto.class)
    @SubclassMapping(source = EssayQuestion.class, target = EssayQuestionDto.class)
    @Mapping(source = "test.id", target = "testId")
    QuestionDto toDto(Question question);

    @SubclassMapping(source = MultipleChoiceQuestionDto.class, target = MultipleChoiceQuestion.class)
    @SubclassMapping(source = TrueFalseQuestionDto.class, target = TrueFalseQuestion.class)
    @SubclassMapping(source = IdentificationQuestionDto.class, target = IdentificationQuestion.class)
    @SubclassMapping(source = EssayQuestionDto.class, target = EssayQuestion.class)
    @Mapping(target = "test", ignore = true)
    Question toEntity(QuestionDto questionDto);
}
