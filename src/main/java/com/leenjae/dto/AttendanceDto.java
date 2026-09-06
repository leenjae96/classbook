package com.leenjae.dto;

import lombok.Builder;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;

@ToString
public class AttendanceDto {

    @Builder
    public record ClassroomSummary(
            Long id,
            Integer grade,
            String classNo,
            Long teacherId,
            String teacherName
    ) {}

    @Builder
    public record Sheet(
            List<StudentAttendance> studentAttendances,
            TeacherReport teacherReport,
            List<TeacherAttendance> teacherAttendances,
            Long serverEpochMillis // 응답 시점의 서버 시각(epoch ms) — 프론트 저장 마감 판단용
    ) {}

    @Builder
    public record StudentAttendance(
            Long id,
            String studentName,
            Integer studentStatus,
            Boolean status,
            String comments,
            Integer pastAttendanceCount,    // 새친구(status=0)에만 값 있음, 나머지는 null (시트 날짜 이전 출석 횟수)
            LocalDate pastAttendanceLastDate, // 시트 날짜 이전 가장 최근 출석일 (없으면 null)
            LocalDate registeredAt          // 첫 출석일(등록일) — 새친구 'new' 뱃지 판단용
    ) {}

    @Builder
    public record TeacherReport(
            Long id,
            String name,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {}

    @Builder
    public record TeacherAttendance(
            Long id,
            String teacherName,
            Boolean status,
            String comments
    ) {}

    public record EditStudentInfo(
            Long id,
            Integer grade,
            String classNo,
            Long classroomId,
            String name,
            Boolean gender,
            String school,
            String phone,
            String parentPhone,
            String address,
            LocalDate birthday,
            Integer status,
            LocalDate registeredAt,
            LocalDate promotedAt,
            String remark,
            String comments,
            String evangelist
    ) {}

    public record RawCumulativeStats(
            Long studentId,
            Integer studentStatus,
            Integer grade,
            String classNo,
            String name,
            LocalDate attendanceDate,
            LocalDate registeredAt,
            LocalDate promotedAt
    ) {}

    public record CumulativeSheet(
            List<String> headerDates,
            List<StudentAttendanceSummary> students
    ) {}

    public record TeacherCumulativeSheet(
            List<String> headerDates,
            List<TeacherAttendanceSummary> teachers
    ) {}

    public record TeacherAttendanceSummary(
            String classroom,
            String name,
            List<String> attendances
    ) {}

    public record StudentAttendanceSummary(
            Integer status,
            Integer grade,
            String classNo,
            String name,
            List<String> attendances, // ["01/04", "01/11", ...]
            String registeredAt,      // "MM/dd" 포맷, null 가능
            String promotedAt         // "MM/dd" 포맷, registeredAt 과 같으면 등반 이력 없음
    ) {}
}
