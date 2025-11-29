package com.athena.lms.athena_lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AthenaLearningManagementSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(AthenaLearningManagementSystemApplication.class, args);

		// create first admin
		PasswordEncoder encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
		String password = encoder.encode("admin123");
		System.out.println("Admin Password: " + password);
	}

}
