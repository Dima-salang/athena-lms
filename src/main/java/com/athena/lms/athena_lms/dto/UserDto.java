package com.athena.lms.athena_lms.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "role")
@JsonSubTypes({
        @JsonSubTypes.Type(value = StudentDto.class, name = "STUDENT"),
        @JsonSubTypes.Type(value = TeacherDto.class, name = "TEACHER"),
        @JsonSubTypes.Type(value = AdminDto.class, name = "ADMIN")
})
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;

    // getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
