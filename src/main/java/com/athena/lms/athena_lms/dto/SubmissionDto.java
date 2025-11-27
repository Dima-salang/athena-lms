package com.athena.lms.athena_lms.dto;

import java.util.Date;

public class SubmissionDto {
    private Long id;
    private TestDto test;
    private UserDto student;
    private Double totalScore;
    private Long timeTaken;
    private Date startTime;
    private Date endTime;
    private Date createdAt;
    private Date updatedAt;
    private int attempts;
}
