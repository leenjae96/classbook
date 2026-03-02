package com.leenjae.repository;

import com.leenjae.domain.TeacherAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {
    List<TeacherAttendance> findByTeacherIdInAndDate(Collection<Long> teacherIds, LocalDate date);

    Optional<TeacherAttendance> findByTeacherIdAndDate(Long teacherId, LocalDate date);
}
