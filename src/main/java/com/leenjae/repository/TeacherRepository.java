package com.leenjae.repository;

import com.leenjae.domain.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    @Query(" SELECT t FROM Teacher t " +
            " WHERE t.roles is not empty and " +
            "       t.classrooms is empty ")
    List<Teacher> findAdministratives();

    @Query(" select t " +
            "from Teacher t " +
            "where month(t.birthday) = :month " +
            "order by t.name ")
    List<Teacher> findByBirthdayMonth(int month);
}
