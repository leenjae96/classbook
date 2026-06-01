package com.leenjae.dto;

import java.time.LocalDate;

public class AdminDto {
    public record TeacherWeeklyReportItem(
            String classroom,
            String name,
            LocalDate date,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {}

    public record TotalReportResponse(
            Integer grade,
            String classNo,
            AttendanceDto.Sheet sheet // ✨ 기존에 만든 완벽한 구조를 그대로 가져다 씁니다!
    ) {}

    public record HistoryResponse(

    ) {}

}
