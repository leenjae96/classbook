package com.leenjae.repository;

import com.leenjae.domain.Teacher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class TeacherRepositoryTest {
    @Autowired
    TeacherRepository teacherRepository;

    @Test
    void test() {

        int count = 0;
        for (int i = 1; i <= 12; i++) {
            System.out.println("생일 : " + i + " ================");
            for (Teacher teacher : teacherRepository.findByBirthdayMonth(i)) {
                System.out.println(teacher.getName() +" 생일 :  "+ teacher.getBirthday());
                count++;
            }
        }
        System.out.println(count);

    }
}