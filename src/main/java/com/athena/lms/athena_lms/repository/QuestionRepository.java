package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.athena.lms.athena_lms.model.questions.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTestId(Long testId);
    List<Question> findByTestIdAndIsDirty(Long testId, boolean isDirty);
    
}
