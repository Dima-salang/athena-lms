package com.athena.lms.athena_lms.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.athena.lms.athena_lms.model.Section;
import com.athena.lms.athena_lms.model.Subject;
import com.athena.lms.athena_lms.model.Teacher;
import com.athena.lms.athena_lms.model.TeacherAssignment;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {
    TeacherAssignment findByTeacher(Teacher teacher);
    TeacherAssignment findBySubject(Subject subject);
    TeacherAssignment findBySection(Section section);
    Page<TeacherAssignment> findAll(Pageable pageable);
    boolean existsByTeacherIdAndSubjectIdAndSectionId(Long teacherId, Long subjectId, Long sectionId);

    
}
