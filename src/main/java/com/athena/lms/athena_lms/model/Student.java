package com.athena.lms.athena_lms.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Student extends User {
    @Column(unique=true, nullable=false)
    private int lrn;

    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;


    // setters and getters
    public int getLrn() {
        return lrn;
    }

    public void setLrn(int lrn) {
        this.lrn = lrn;
    }

    public Section getSection() {
        return section;
    }

    public void setSection(Section section) {
        this.section = section;
    }

}
