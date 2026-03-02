package com.leenjae.repository;

import com.leenjae.domain.TeacherReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;

public interface TeacherReportRepository extends JpaRepository<TeacherReport, Long> {

    @Query("select a from TeacherReport a " +
            "join fetch a.teacher t " +
            "where t.id = :teacherId and a.date = :date "
    )
    TeacherReport findByTeacherIdAndDate(
            @Param("teacherId") Long teacherId,
            @Param("date") LocalDate date
    );

}
