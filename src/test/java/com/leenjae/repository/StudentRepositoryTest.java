package com.leenjae.repository;

import com.leenjae.domain.Student;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class StudentRepositoryTest {

    @Autowired
    StudentRepository studentRepository;

    @Test
    void findByClassroomId() {
    }

    @Test
    void findByRolesIn() {
    }

    @Test
    void findByBirthdayMonth() {
        int count = 0;
        for (int i = 1; i <= 12; i++) {
            System.out.println("생일 : " + i + " ================");
            for (Student student : studentRepository.findByBirthdayMonth(i)) {
                System.out.println(student.getName() +" 생일 :  "+ student.getBirthday());
                count++;
            }
        }
        System.out.println(count);
    }
}