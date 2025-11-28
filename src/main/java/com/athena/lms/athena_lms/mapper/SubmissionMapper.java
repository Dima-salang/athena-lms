package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.SubmissionDto;
import com.athena.lms.athena_lms.model.submission.Submission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { StudentMapper.class, TestMapper.class })
public interface SubmissionMapper {
    @Mapping(source = "test", target = "test")
    @Mapping(source = "student", target = "student")
    SubmissionDto toDto(Submission submission);

    @Mapping(source = "test", target = "test")
    @Mapping(source = "student", target = "student")
    Submission toEntity(SubmissionDto submissionDto);
}
