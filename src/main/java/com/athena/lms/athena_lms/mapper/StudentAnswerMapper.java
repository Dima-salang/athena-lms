package com.athena.lms.athena_lms.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.athena.lms.athena_lms.dto.StudentAnswerDto;
import com.athena.lms.athena_lms.model.submission.StudentAnswer;

@Mapper(componentModel = "spring", uses = { SubmissionMapper.class, QuestionMapper.class })
public interface StudentAnswerMapper {
    @Mapping(source = "option.id", target = "optionId")
    StudentAnswerDto toDto(StudentAnswer studentAnswer);

    @Mapping(target = "option.id", ignore = true)
    StudentAnswer toEntity(StudentAnswerDto studentAnswerDto);

    @Mapping(target = "option.id", ignore = true)
    void updateEntityFromDto(StudentAnswerDto studentAnswerDto, @MappingTarget StudentAnswer studentAnswer);

    List<StudentAnswer> toEntityList(List<StudentAnswerDto> dtos);

    List<StudentAnswerDto> toDtoList(List<StudentAnswer> entities);

}
