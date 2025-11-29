package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.dto.SectionDto;
import com.athena.lms.athena_lms.model.Section;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SectionMapper {
    @Mapping(target = "adviserName", expression = "java(section.getAdviser() != null ? section.getAdviser().getFirstName() + \" \" + section.getAdviser().getLastName() : null)")
    SectionDto toDto(Section section);

    Section toEntity(SectionDto sectionDto);
}
