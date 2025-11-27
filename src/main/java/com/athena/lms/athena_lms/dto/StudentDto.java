package com.athena.lms.athena_lms.dto;

public class StudentDto extends UserDto {
    private int lrn;
    private SectionDto section;


    // getters and setters
    public int getLrn() {
        return lrn;
    }

    public void setLrn(int lrn) {
        this.lrn = lrn;
    }

    public SectionDto getSection() {
        return section;
    }

    public void setSection(SectionDto section) {
        this.section = section;
    }
    
}
