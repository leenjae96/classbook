package com.leenjae.repository;

import com.leenjae.domain.TeacherAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {

    @Query("select a from TeacherAttendance a " +
            "join fetch a.teacher t " +
            "where t.id = :teacherId and a.date = :date "
    )
    TeacherAttendance findByTeacherIdAndDate(
            @Param("teacherId") Long teacherId,
            @Param("date") LocalDate date
    );
}
