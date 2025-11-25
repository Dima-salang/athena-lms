package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.OptionDto;
import com.athena.lms.athena_lms.model.options.Option;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OptionMapper {
    @Mapping(source = "question.id", target = "questionId")
    @Mapping(source = "test.id", target = "testId")
    OptionDto toDto(Option option);

    @Mapping(target = "question", ignore = true) // Handled by service or parent
    @Mapping(target = "test", ignore = true)
    Option toEntity(OptionDto optionDto);
}
