package com.leenjae.dto;

import lombok.Builder;
import lombok.ToString;

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

    public record AdministrativeSummary(
            Integer roleCode,
            Long teacherId
    ) {}

    public record newFriend() {}

    @Builder
    public record Sheet(
            List<StudentAttendance> studentAttendances,
            TeacherReport teacherReport,
            List<TeacherAttendance> teacherAttendances
    ) {}

    @Builder
    public record StudentAttendance(
            Long id,
            String studentName,
            Boolean status,
            String comments
    ) {}

    @Builder
    public record TeacherReport(
            Long id,
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
}
