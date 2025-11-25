package com.athena.lms.athena_lms.mapper;

import com.athena.lms.athena_lms.model.Section;
import com.dto.SectionDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SectionMapper {
    SectionDto toDto(Section section);

    Section toEntity(SectionDto sectionDto);
}
