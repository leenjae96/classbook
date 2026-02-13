package com.leenjae.repository;

import com.leenjae.domain.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {

    //LEE: fetch 명령어에 대해서?
    @Query( "select a from StudentAttendance a " +
            "join fetch a.student s " +
            "where s.classroom.id = :classroomdId and a.date = :date "
    )
    List<StudentAttendance> findByClassroomIdAndDate(
            @Param("classroomId")Long classroomId,
            @Param("date") LocalDate date
    );

    Optional<StudentAttendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<StudentAttendance> findByStudentIdInAndDate(List<Long> studentIds, LocalDate date);

}
