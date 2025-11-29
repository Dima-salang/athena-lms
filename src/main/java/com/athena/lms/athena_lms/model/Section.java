package com.athena.lms.athena_lms.model;

import jakarta.persistence.*;

@Entity
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    // adviser
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = true)
    private Teacher adviser;

    // setters and getters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Teacher getAdviser() {
        return adviser;
    }

    public void setAdviser(Teacher adviser) {
        this.adviser = adviser;
    }
}
