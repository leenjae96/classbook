package com.leenjae.dto;

import java.time.LocalDate;
import java.util.List;

public class AdminDto {
    public record RawCumulativeStats(
            Long studentId,
            Integer studentStatus,
            Integer grade,
            String classNo,
            String name,
            LocalDate attendanceDate
    ) {}

    public record CumulativeSheet(
            List<String> headerDates,
            List<StudentAttendanceSummary> students
    ) {}

    public record StudentAttendanceSummary(
            Integer status,
            Integer grade,
            String classNo,
            String name,
            List<String> attendances // ["01/04", "01/11", ...]
    ) {}

    public record TotalReportResponse(
            Integer grade,
            String classNo,
            AttendanceDto.Sheet sheet // ✨ 기존에 만든 완벽한 구조를 그대로 가져다 씁니다!
    ) {}

}
