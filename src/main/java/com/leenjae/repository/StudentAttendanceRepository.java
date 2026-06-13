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

    // 새친구 등반 판단용: 특정 날짜 이전의 출석 횟수 + 가장 최근 출석일 (오늘 제외)
    @Query("""
        SELECT sa.student.id, COUNT(sa), MAX(sa.date)
        FROM StudentAttendance sa
        WHERE sa.student.id IN :studentIds
          AND sa.status = true
          AND sa.date < :beforeDate
        GROUP BY sa.student.id
    """)
    List<Object[]> countPastAttendanceByStudentIds(
            @Param("studentIds") List<Long> studentIds,
            @Param("beforeDate") LocalDate beforeDate
    );

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
    //  - attendance/total : 현재 새친구(status=0) 출석/전체
    //  - tracing*         : 올해 등록 추적 = 올해 등록(registeredAt ≠ 올해 1/1 placeholder) 이면서 status ∈ {0,1}
    //                       (status 2 졸업·3 별분·4 휴직은 재적 제외이므로 카운트 안 함)
    //                       → 누적통계 '새친구 시트'와 동일 기준 (getRawCumulativeStatsForNewFriends)
    @Query("""
                SELECT new com.leenjae.dto.StatisticsDto$NewFriendStats(
                            COALESCE(SUM(CASE WHEN s.status = 0 AND sa.status = true THEN 1L ELSE 0L END), 0L),
                            COALESCE(SUM(CASE WHEN s.status = 0 THEN 1L ELSE 0L END), 0L),
                            COALESCE(SUM(CASE WHEN (s.status = 0 OR s.status = 1) AND s.registeredAt <> :excludeDate AND sa.status = true THEN 1L ELSE 0L END), 0L),
                            COALESCE(SUM(CASE WHEN (s.status = 0 OR s.status = 1) AND s.registeredAt <> :excludeDate THEN 1L ELSE 0L END), 0L)
                        )
                        FROM Student s
                        LEFT JOIN StudentAttendance sa ON sa.student = s AND sa.date = :date
                        WHERE s.status = 0 OR (s.status = 1 AND s.registeredAt <> :excludeDate)
            """)
    StatisticsDto.NewFriendStats getNewFriendStatsByDate(
            @Param("date") LocalDate date,
            @Param("excludeDate") LocalDate excludeDate // 올해 1/1 placeholder (등록일 미상)
    );

    @Query("""
                SELECT new com.leenjae.dto.AttendanceDto$RawCumulativeStats(
                    s.id, s.status, c.grade, c.classNo, s.name, sa.date, s.registeredAt, s.promotedAt
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
                    s.id, s.status, c.grade, c.classNo, s.name, sa.date, s.registeredAt, s.promotedAt
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

    // 새친구 누적 통계 전용: 올해 등록(registeredAt ≠ 올해 1/1 = startDate) 이면서 status ∈ {0,1}
    //  (status 2 졸업·3 별분·4 휴직은 재적 제외이므로 미포함 / '올해 등록 추적' 통계와 동일 기준)
    @Query("""
                SELECT new com.leenjae.dto.AttendanceDto$RawCumulativeStats(
                    s.id, s.status, c.grade, c.classNo, s.name, sa.date, s.registeredAt, s.promotedAt
                )
                FROM Student s
                LEFT JOIN s.classroom c
                LEFT JOIN StudentAttendance sa ON
                            sa.student = s AND
                            sa.status = true AND
                            sa.date >= :startDate AND
                            sa.date <= :endDate
                WHERE (s.status = 0 OR s.status = 1) AND s.registeredAt <> :startDate
                ORDER BY s.status ASC, c.grade ASC, s.name ASC
            """)
    List<AttendanceDto.RawCumulativeStats> getRawCumulativeStatsForNewFriends(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

}
