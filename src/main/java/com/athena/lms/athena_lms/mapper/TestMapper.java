package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.TestDto;
import com.athena.lms.athena_lms.model.tests.Test;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { QuestionMapper.class, SubjectMapper.class, SectionMapper.class })
public interface TestMapper {

    @Mapping(source = "subject.id", target = "subjectId")
    @Mapping(source = "section.id", target = "sectionId")
    @Mapping(source = "teacher.id", target = "teacherId")
    @Mapping(source = "testIssueDate", target = "testIssueDate")
    @Mapping(source = "testDueDate", target = "testDueDate")
    @Mapping(source = "testDuration", target = "testDuration")
    @Mapping(source = "hasInfiniteTime", target = "hasInfiniteTime")
    TestDto toDto(Test test);

    @Mapping(target = "subject", ignore = true) // Handled by service based on ID
    @Mapping(target = "section", ignore = true) // Handled by service based on ID
    @Mapping(target = "teacher", ignore = true) // Handled by service based on ID
    @Mapping(target = "testIssueDate", source = "testIssueDate")
    @Mapping(target = "testDueDate", source = "testDueDate")
    @Mapping(target = "testDuration", source = "testDuration")
    @Mapping(target = "hasInfiniteTime", source = "hasInfiniteTime")
    Test toEntity(TestDto testDto);
}
