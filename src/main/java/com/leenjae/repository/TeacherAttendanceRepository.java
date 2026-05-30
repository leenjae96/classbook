package com.leenjae.repository;

import com.leenjae.domain.TeacherAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {
    List<TeacherAttendance> findByTeacherIdInAndDate(Collection<Long> teacherIds, LocalDate date);

    Optional<TeacherAttendance> findByTeacherIdAndDate(Long teacherId, LocalDate date);

    @Query("SELECT ta FROM TeacherAttendance ta JOIN FETCH ta.teacher t WHERE ta.date BETWEEN :startDate AND :endDate ORDER BY t.name, ta.date")
    List<TeacherAttendance> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
