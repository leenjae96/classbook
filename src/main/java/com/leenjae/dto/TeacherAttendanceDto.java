package com.leenjae.dto;

import com.leenjae.domain.TeacherAttendance;

public class TeacherAttendanceDto {
    public record Request(
            Long teacherId,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {
    }

    public record Response(
            Long teacherId,
            Integer worship,
            Boolean otn,
            Integer dawnPray,
            String comments
    ) {
        public static Response from(TeacherAttendance teacherAttendance) {
            return new Response(
                    teacherAttendance.getId(),
                    teacherAttendance.getWorship(),
                    teacherAttendance.getOtn(),
                    teacherAttendance.getDawnPray(),
                    teacherAttendance.getComments()
            );
        }

        public static Response empty(Long teacherId) {
            return new Response(teacherId, null, null, null, null);
        }
    }
}
