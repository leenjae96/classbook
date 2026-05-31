package com.leenjae.dto;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

public class StatisticsDto {

    public record WeeklyDashboardResponse(
            String date,
            Long grade0,
            Long grade1,
            Long grade2,
            Long grade3
    ) {}

    public record WeeklyGradeStats(
            LocalDate date,
            Integer grade,
            Long attendanceCount
    ) {}

    @Builder
    public record Response(
            List<StudentStats> classStats,
            NewFriendStats newFriendStats,
            LocalDate date
    ) {
    }

    public record StudentStats(
            Integer grade,
            String classNo,
            Long male,
            Long female,
            Long attendance,
            Long total,
            Boolean isSummited
    ) {
    }

    @Builder
    public record NewFriendStats(
            Long attendance,
            Long total,
            Long tracingAttendance, // 올해 우리교회 등록한 새친구 추적용
            Long tracingTotal // 올해 우리교회 등록한 새친구 추적용
    ) {
    }

    public record TeacherStats(
            Long teacherId,
            String name,
            Long attendance,
            Long total,
            LocalDate date
    ) {
    }
}