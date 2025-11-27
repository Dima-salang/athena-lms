package com.athena.lms.athena_lms.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "role", visible = true)
@JsonSubTypes({
    @JsonSubTypes.Type(value = StudentDto.class, name = "STUDENT"),
    @JsonSubTypes.Type(value = TeacherDto.class, name = "TEACHER"),
    @JsonSubTypes.Type(value = AdminDto.class, name = "ADMIN")
})
public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String role;
    private String username;

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
