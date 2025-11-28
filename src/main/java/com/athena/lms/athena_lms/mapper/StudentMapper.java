package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.StudentDto;
import com.athena.lms.athena_lms.model.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { SectionMapper.class })
public interface StudentMapper {
    @Mapping(source = "section.id", target = "section.id")
    @Mapping(source = "section.name", target = "section.name")
    StudentDto toDto(Student student);

    @Mapping(target = "section", ignore = true) // Handled by service or parent
    Student toEntity(StudentDto studentDto);
}
