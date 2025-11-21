package com.athena.lms.athena_lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.athena.lms.athena_lms.model.options.Option;

public interface OptionRepository extends JpaRepository<Option, Long> {
}
