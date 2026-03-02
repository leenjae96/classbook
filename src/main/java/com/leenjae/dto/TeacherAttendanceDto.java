package com.leenjae.dto;

import com.leenjae.domain.TeacherReport;

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
        public static Response from(TeacherReport teacherReport) {
            return new Response(
                    teacherReport.getId(),
                    teacherReport.getWorship(),
                    teacherReport.getOtn(),
                    teacherReport.getDawnPray(),
                    teacherReport.getComments()
            );
        }

        public static Response empty(Long teacherId) {
            return new Response(teacherId, null, null, null, null);
        }
    }
}
