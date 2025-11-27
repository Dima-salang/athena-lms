package com.athena.lms.athena_lms.model.questions;

import jakarta.persistence.Entity;

@Entity
public class EssayQuestion extends Question {
    private int points;

    // getters and setters
    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
