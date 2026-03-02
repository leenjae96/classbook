package com.leenjae.dto;

import java.time.LocalDate;

public class StatisticsDto {

    public record GradeStats(
            Integer grade,
            Long attendance,
            Long total,
            LocalDate date
    ) {
    }

    public record ClassStats(
            Integer grade,
            String classNo,
            Long attendance,
            Long total,
            LocalDate date
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
