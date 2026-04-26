package com.leenjae.repository;

import com.leenjae.domain.StudentAttendance;
import com.leenjae.dto.AdminDto;
import com.leenjae.dto.AttendanceDto;
import com.leenjae.dto.StatisticsDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {

    //LEE: fetch 명령어에 대해서?
    @Query("select a from StudentAttendance a " +
            "join fetch a.student s " +
            "where s.classroom.id = :classroomdId and a.date = :date "
    )
    List<StudentAttendance> findByClassroomIdAndDate(
            @Param("classroomId") Long classroomId,
            @Param("date") LocalDate date
    );

    List<StudentAttendance> findByDate(LocalDate date);

    Optional<StudentAttendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<StudentAttendance> findByStudentIdInAndDate(List<Long> studentIds, LocalDate date);

    //대시보드용
    @Query("""
    SELECT new com.leenjae.dto.StatisticsDto$WeeklyGradeStats(
        sa.date,
        c.grade,
        COUNT(sa.id)
    )
    FROM StudentAttendance sa
    JOIN sa.student s
    JOIN s.classroom c
    WHERE sa.date BETWEEN :startDate AND :endDate
      AND sa.status = true
      AND s.status = 1
    GROUP BY sa.date, c.grade
    ORDER BY sa.date ASC, c.grade ASC
""")
    List<StatisticsDto.WeeklyGradeStats> getWeeklyGradeStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // 1. 학생 통계
    @Query("""
                SELECT new com.leenjae.dto.StatisticsDto$StudentStats(
                    c.grade,
                    c.classNo,
                    SUM(CASE WHEN s.gender = true AND sa.status = true THEN 1L ELSE 0L END),
                    SUM(CASE WHEN s.gender = false AND sa.status = true THEN 1L ELSE 0L END),
                    COALESCE(SUM(CASE WHEN sa.status = true THEN 1L ELSE 0L END), 0L),
                    COUNT(s.id),
                    CASE WHEN COUNT(sa.id) > 0 THEN true ELSE false END
                )
                FROM Student s
                JOIN s.classroom c
                LEFT JOIN StudentAttendance sa ON sa.student = s AND sa.date = :date
                WHERE c.teacher IS NOT NULL
                  AND s.status = 1
                GROUP BY c.grade, c.classNo
                ORDER BY c.grade, CAST(c.classNo AS int)
            """)// status조절.
    List<StatisticsDto.StudentStats> getStudentStatsByDate(@Param("date") LocalDate date);

    // 2. 새친구 통계
    @Query("""
                SELECT new com.leenjae.dto.StatisticsDto$NewFriendStats(
                    COALESCE(SUM(CASE WHEN sa.status = true THEN 1L ELSE 0L END), 0L),
                    COUNT(s.id)
                )
                FROM Student s
                LEFT JOIN StudentAttendance sa ON sa.student = s AND sa.date = :date
                WHERE s.status = 0
            """)
    StatisticsDto.NewFriendStats getNewFriendStatsByDate(@Param("date") LocalDate date);

    @Query("""
                SELECT new com.leenjae.dto.AttendanceDto$RawCumulativeStats(
                    s.id, s.status, c.grade, c.classNo, s.name, sa.date
                )
                FROM Student s
                LEFT JOIN s.classroom c
                LEFT JOIN StudentAttendance sa ON 
                            sa.student = s AND 
                            sa.status = true AND 
                            sa.date >= :startDate AND
                            sa.date <= :endDate
                ORDER BY s.status ASC, c.grade ASC, CAST(c.classNo AS int) ASC, s.name ASC
            """)
    List<AttendanceDto.RawCumulativeStats> getRawCumulativeStats(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );


    @Query("""
                SELECT new com.leenjae.dto.AttendanceDto$RawCumulativeStats(
                    s.id, s.status, c.grade, c.classNo, s.name, sa.date
                )
                FROM Student s
                JOIN s.classroom c
                LEFT JOIN StudentAttendance sa ON 
                            sa.student = s AND 
                            sa.status = true AND 
                            sa.date >= :startDate AND
                            sa.date <= :endDate
                WHERE c.grade = :grade AND c.classNo = :classNo AND s.status != 3
                ORDER BY s.status ASC, c.grade ASC, CAST(c.classNo AS int) ASC, s.name ASC
            """)
    List<AttendanceDto.RawCumulativeStats> getRawCumulativeStatsByClassroom(
            @Param("grade") Integer grade,
            @Param("classNo") String classNo,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}
