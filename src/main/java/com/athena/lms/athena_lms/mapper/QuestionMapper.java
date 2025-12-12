package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.*;
import com.athena.lms.athena_lms.model.questions.*;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { OptionMapper.class })
public interface QuestionMapper {

    @Mapping(source = "test.id", target = "testId")
    QuestionDto toDto(Question question);

    @Mapping(target = "test", ignore = true)
    Question toEntity(QuestionDto questionDto);
}
