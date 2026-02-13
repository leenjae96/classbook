package com.leenjae.dto;

import com.leenjae.domain.Teacher;

import java.time.LocalDate;

public class TeacherDto {
    public record Response(
            Long id,
            String name,
            Boolean gender,
            String phone,
            LocalDate birthday,
            Boolean isLunar
    ) {
        public Response(Teacher teacher) {
            this(
                    teacher.getId(),
                    teacher.getName(),
                    teacher.getGender(),
                    teacher.getPhone(),
                    teacher.getBirthday(),
                    teacher.getIsLunar()
            );
        }
    }
}
