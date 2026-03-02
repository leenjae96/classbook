package com.leenjae.service;

import com.leenjae.dto.StatisticsDto;
import com.leenjae.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {
    private final ClassroomRepository classroomRepository;
    private final StudentRepository studentRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherReportRepository teacherReportRepository;

    public List<StatisticsDto.GradeStats> getGradeStatistics(LocalDate date) {
        return studentAttendanceRepository.getGradeStatsByDate(date);
    }

    public List<StatisticsDto.ClassStats> getClassStatistics(LocalDate date) {
        return studentAttendanceRepository.getClassStatsByDate(date);
    }

    public List<StatisticsDto.TeacherStats> getTeacherStatistics(LocalDate date) {
        return null;
    }
}
