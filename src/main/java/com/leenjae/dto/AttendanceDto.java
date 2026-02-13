package com.leenjae.dto;

import lombok.Builder;

import java.util.List;

public class AttendanceDto {

    @Builder
    public record ClassroomSummary(
            Long id,
            Integer grade,
            String classNo,
            Long teacherId,
            String teacherName
    ) {
    }

    public record AdministrativeSummary(
            Integer roleCode,
            Long teacherId
    ) {}

    public record newFriend() {}

    @Builder
    public record Sheet(
            List<StudentCheck> studentChecks,
            TeacherCheck teacherCheck
    ) {}

    @Builder
    public record StudentCheck(
            Long id,
            String studentName,
            Boolean status,
            String comments
    ) {}

    @Builder
    public record TeacherCheck(
            Long id,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {}
}
