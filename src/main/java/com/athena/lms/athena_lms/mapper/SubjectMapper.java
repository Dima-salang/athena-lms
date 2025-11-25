package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.model.Subject;
import com.dto.SubjectDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubjectMapper {
    SubjectDto toDto(Subject subject);

    Subject toEntity(SubjectDto subjectDto);
}
