package com.leenjae;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ClassbookApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClassbookApplication.class, args);
    }
}