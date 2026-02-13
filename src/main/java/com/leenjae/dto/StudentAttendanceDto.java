package com.leenjae.dto;

import com.leenjae.domain.StudentAttendance;

public class StudentAttendanceDto {

    public record Request(
            Long studentId,
            Boolean status,
            String comments
    ) {
    }

    public record Response(
            Long studentId,
            Boolean status,
            String comments
    ) {
        public static Response from(StudentAttendance studentAttendance) {
            return new Response(
                    studentAttendance.getStudent().getId(),
                    studentAttendance.getStatus(),
                    studentAttendance.getComments()
            );
        }

        public static Response empty(Long studentId) {
            return new Response(
                    studentId,
                    null,
                    null
            );
        }
    }
}
