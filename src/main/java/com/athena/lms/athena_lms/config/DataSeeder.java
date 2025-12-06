package com.athena.lms.athena_lms.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.athena.lms.athena_lms.model.Admin;
import com.athena.lms.athena_lms.repository.UserRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin") == null) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("ADMIN");
                admin.setFirstName("Admin");
                admin.setLastName("User");
                userRepository.save(admin);
                System.out.println("Default admin user created.");
            }
        };
    }
}
