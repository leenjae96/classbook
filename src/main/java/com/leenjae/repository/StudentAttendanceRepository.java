package com.leenjae.repository;

import com.leenjae.domain.StudentAttendance;
import com.leenjae.dto.StatisticsDto;
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

    List<StudentAttendance> findByDate(LocalDate date);

    Optional<StudentAttendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<StudentAttendance> findByStudentIdInAndDate(List<Long> studentIds, LocalDate date);
    // 1. 학년별 통계

    @Query("""
        SELECT new com.leenjae.dto.StatisticsDto$GradeStats(
            c.grade, 
            SUM(CASE WHEN sa.status = true THEN 1L ELSE 0L END), 
            COUNT(sa.id), 
            sa.date
        )
        FROM StudentAttendance sa
        JOIN sa.student s
        JOIN s.classroom c
        WHERE sa.date = :date
        GROUP BY c.grade, sa.date 
        ORDER BY c.grade
    """)
    List<StatisticsDto.GradeStats> getGradeStatsByDate(@Param("date") LocalDate targetDate);

    // 2. 반별 통계
    @Query("""
        SELECT new com.leenjae.dto.StatisticsDto$ClassStats(
            c.grade, 
            c.classNo, 
            SUM(CASE WHEN sa.status = true THEN 1L ELSE 0L END), 
            COUNT(sa.id), 
            sa.date
        )
        FROM StudentAttendance sa
        JOIN sa.student s
        JOIN s.classroom c
        WHERE sa.date = :date
        GROUP BY c.grade, c.classNo, sa.date
        ORDER BY c.grade, CAST(c.classNo AS int)
    """)
    List<StatisticsDto.ClassStats> getClassStatsByDate(@Param("date") LocalDate targetDate);

}
